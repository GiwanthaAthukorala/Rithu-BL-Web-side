const Video = require("../models/Video");
const VideoWatchSession = require("../models/VideoWatchSession");
const Earnings = require("../models/Earnings");

// Enhanced video controller with better error handling and YouTube embed fixes
exports.getAvailableVideos = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find videos that user hasn't watched completely
    const watchedVideos = await VideoWatchSession.find({
      user: userId,
      status: "completed",
    }).select("video");

    const watchedVideoIds = watchedVideos.map((session) => session.video);

    const availableVideos = await Video.find({
      isActive: true,
      _id: { $nin: watchedVideoIds },
    });

    // Filter out videos that reached max views
    const filteredVideos = availableVideos.filter(
      (video) => !video.maxViews || video.currentViews < video.maxViews
    );

    // Enhance embed URLs to prevent blocking
    const enhancedVideos = filteredVideos.map((video) => {
      if (video.platform === "youtube") {
        // Add parameters to prevent blocking
        const enhancedEmbedUrl = video.embedUrl.includes("?")
          ? `${video.embedUrl}&rel=0&modestbranding=1&playsinline=1`
          : `${video.embedUrl}?rel=0&modestbranding=1&playsinline=1`;

        return {
          ...video.toObject(),
          embedUrl: enhancedEmbedUrl,
        };
      }
      return video;
    });

    res.json({
      success: true,
      data: enhancedVideos,
      count: enhancedVideos.length,
    });
  } catch (error) {
    console.error("Get videos error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
    });
  }
};

// Enhanced session management with better validation
exports.startVideoSession = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Validate videoId
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video ID",
      });
    }

    // Check if video exists and is active
    const video = await Video.findOne({
      _id: videoId,
      isActive: true,
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found or inactive",
      });
    }

    // Check if video reached max views
    if (video.maxViews && video.currentViews >= video.maxViews) {
      return res.status(400).json({
        success: false,
        message: "This video has reached its maximum view limit",
      });
    }

    // Check if user already completed this video
    const existingCompletedSession = await VideoWatchSession.findOne({
      user: userId,
      video: videoId,
      status: "completed",
    });

    if (existingCompletedSession) {
      return res.status(400).json({
        success: false,
        message: "You have already watched this video and earned the reward",
      });
    }

    // Check if there's an existing active session
    const existingActiveSession = await VideoWatchSession.findOne({
      user: userId,
      video: videoId,
      status: { $in: ["watching", "paused"] },
    });

    let session;
    if (existingActiveSession) {
      // Resume existing session
      session = existingActiveSession;
      session.startTime = new Date();
      session.status = "watching";
      await session.save();
    } else {
      // Create new session
      session = await VideoWatchSession.create({
        user: userId,
        video: videoId,
        startTime: new Date(),
        status: "watching",
        watchDuration: 0,
      });
    }

    // Enhance embed URL for frontend
    let enhancedEmbedUrl = video.embedUrl;
    if (video.platform === "youtube") {
      enhancedEmbedUrl = video.embedUrl.includes("?")
        ? `${video.embedUrl}&rel=0&modestbranding=1&playsinline=1`
        : `${video.embedUrl}?rel=0&modestbranding=1&playsinline=1`;
    }

    res.json({
      success: true,
      data: {
        sessionId: session._id,
        video: {
          ...video.toObject(),
          embedUrl: enhancedEmbedUrl,
        },
        startTime: session.startTime,
        platform: video.platform,
        duration: video.duration,
        requiredWatchTime: video.duration, // Minimum time to earn reward
      },
    });
  } catch (error) {
    console.error("Start video session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start video session",
    });
  }
};

// Enhanced progress tracking with fraud prevention
exports.updateWatchProgress = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { currentTime, isCompleted = false } = req.body;
    const userId = req.user._id;

    // Validate sessionId
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session ID",
      });
    }

    const session = await VideoWatchSession.findOne({
      _id: sessionId,
      user: userId,
    }).populate("video");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    // If video already completed, return success but don't process further
    if (session.status === "completed") {
      return res.json({
        success: true,
        data: {
          watchDuration: session.watchDuration,
          status: session.status,
          rewardGiven: session.rewardGiven,
          amountEarned: session.amountEarned,
          message: "Video already completed",
        },
      });
    }

    // Validate currentTime (fraud prevention)
    const maxAllowedTime = session.video.duration + 10; // Allow 10 seconds buffer
    const validatedCurrentTime = Math.min(
      Math.max(0, currentTime),
      maxAllowedTime
    );

    // Update watch duration (only if it's progressing forward)
    if (validatedCurrentTime > session.watchDuration) {
      session.watchDuration = validatedCurrentTime;
    }

    // Check if video is completed
    const requiredDuration = session.video.duration;
    const completionThreshold = requiredDuration * 0.9; // 90% completion required

    if (
      (session.watchDuration >= completionThreshold || isCompleted) &&
      !session.rewardGiven
    ) {
      console.log(
        `Video completed! User: ${userId}, Duration: ${session.watchDuration}s`
      );
      await completeVideoSession(session);
    }

    await session.save();

    res.json({
      success: true,
      data: {
        watchDuration: session.watchDuration,
        status: session.status,
        rewardGiven: session.rewardGiven,
        amountEarned: session.amountEarned,
        progress: Math.min(
          100,
          (session.watchDuration / requiredDuration) * 100
        ),
        requiredDuration: requiredDuration,
      },
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    });
  }
};

// Enhanced completion handler with transaction support
const completeVideoSession = async (session) => {
  const dbSession = await mongoose.startSession();

  try {
    await dbSession.withTransaction(async () => {
      session.status = "completed";
      session.endTime = new Date();
      session.rewardGiven = true;
      session.amountEarned = session.video.rewardAmount;

      console.log(
        `Awarding Rs ${session.amountEarned} to user ${session.user}`
      );

      // Update video views
      await Video.findByIdAndUpdate(
        session.video._id,
        { $inc: { currentViews: 1 } },
        { session: dbSession }
      );

      // Update user earnings
      await updateUserEarnings(
        session.user,
        session.video.rewardAmount,
        dbSession
      );

      await session.save({ session: dbSession });

      // Emit socket event for real-time update
      const io = require("../server").io;
      if (io) {
        io.to(session.user.toString()).emit("videoCompleted", {
          videoId: session.video._id,
          videoTitle: session.video.title,
          amount: session.video.rewardAmount,
          sessionId: session._id,
          timestamp: new Date(),
        });
      }

      console.log(
        `Successfully awarded Rs ${session.amountEarned} to user ${session.user}`
      );
    });
  } catch (error) {
    console.error("Complete session error:", error);
    throw error;
  } finally {
    await dbSession.endSession();
  }
};

// Update user earnings with transaction support
const updateUserEarnings = async (userId, amount, dbSession = null) => {
  try {
    const options = dbSession ? { session: dbSession } : {};

    let earnings = await Earnings.findOne({ user: userId }, null, options);

    if (!earnings) {
      earnings = await Earnings.create(
        [
          {
            user: userId,
            totalEarned: amount,
            availableBalance: amount,
            lifetimeEarnings: amount,
          },
        ],
        options
      );
      earnings = earnings[0];
      console.log(
        `Created new earnings record for user ${userId} with Rs ${amount}`
      );
    } else {
      earnings.totalEarned += amount;
      earnings.availableBalance += amount;
      earnings.lifetimeEarnings += amount;
      await earnings.save(options);
      console.log(
        `Updated earnings for user ${userId}: Total: Rs ${earnings.totalEarned}, Available: Rs ${earnings.availableBalance}`
      );
    }

    return earnings;
  } catch (error) {
    console.error("Update earnings error:", error);
    throw error;
  }
};

// Get user's video watch history with pagination
exports.getWatchHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const history = await VideoWatchSession.find({
      user: userId,
    })
      .populate("video")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await VideoWatchSession.countDocuments({ user: userId });

    res.json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch watch history",
    });
  }
};
