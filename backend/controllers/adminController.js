const Submission = require("../models/Submission");
const YoutubeSubmission = require("../models/YoutubeSubmission");
const FbReviewSubmission = require("../models/FbReviewSubmission");
const FbCommentSubmission = require("../models/FbCommentSubmission");
const GoogleReviewSubmission = require("../models/GoogleReviewModel");
const User = require("../models/userModel");

// Get all submissions with pagination and filtering
const getAllSubmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      platform,
      status,
      dateFrom,
      dateTo,
      userId,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};
    if (platform) filter.platform = platform;
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    // Date range filter
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = endDate;
      }
    }

    // Get submissions from all platforms
    const [
      fbSubmissions,
      youtubeSubmissions,
      fbReviewSubmissions,
      fbCommentSubmissions,
      googleReviewSubmissions,
    ] = await Promise.all([
      Submission.find(filter)
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      YoutubeSubmission.find(filter)
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      FbReviewSubmission.find(filter)
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      FbCommentSubmission.find(filter)
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),

      GoogleReviewSubmission.find(filter)
        .populate("user", "firstName lastName email phoneNumber")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    // Combine all submissions
    const allSubmissions = [
      ...fbSubmissions.map((sub) => ({
        ...sub.toObject(),
        platformType: "facebook",
      })),
      ...youtubeSubmissions.map((sub) => ({
        ...sub.toObject(),
        platformType: "youtube",
      })),
      ...fbReviewSubmissions.map((sub) => ({
        ...sub.toObject(),
        platformType: "fb-review",
      })),
      ...fbCommentSubmissions.map((sub) => ({
        ...sub.toObject(),
        platformType: "fb-comment",
      })),
      ...googleReviewSubmissions.map((sub) => ({
        ...sub.toObject(),
        platformType: "google-review",
      })),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Get counts for each platform
    const counts = await Promise.all([
      Submission.countDocuments(filter),
      YoutubeSubmission.countDocuments(filter),
      FbReviewSubmission.countDocuments(filter),
      FbCommentSubmission.countDocuments(filter),
      GoogleReviewSubmission.countDocuments(filter),
    ]);

    const totalCount = counts.reduce((sum, count) => sum + count, 0);

    res.json({
      success: true,
      data: {
        submissions: allSubmissions.slice(0, limitNum),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalSubmissions: totalCount,
          hasNext: pageNum < Math.ceil(totalCount / limitNum),
          hasPrev: pageNum > 1,
        },
        platformCounts: {
          facebook: counts[0],
          youtube: counts[1],
          fbReview: counts[2],
          fbComment: counts[3],
          googleReview: counts[4],
        },
      },
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
      error: error.message,
    });
  }
};

// Get submission statistics
const getSubmissionStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalSubmissions,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      recentSubmissions,
      topUsers,
    ] = await Promise.all([
      // Total submissions count
      Promise.all([
        Submission.countDocuments(),
        YoutubeSubmission.countDocuments(),
        FbReviewSubmission.countDocuments(),
        FbCommentSubmission.countDocuments(),
        GoogleReviewSubmission.countDocuments(),
      ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

      // Pending submissions
      Promise.all([
        Submission.countDocuments({ status: "pending" }),
        YoutubeSubmission.countDocuments({ status: "pending" }),
        FbReviewSubmission.countDocuments({ status: "pending" }),
        FbCommentSubmission.countDocuments({ status: "pending" }),
        GoogleReviewSubmission.countDocuments({ status: "pending" }),
      ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

      // Approved submissions
      Promise.all([
        Submission.countDocuments({ status: "approved" }),
        YoutubeSubmission.countDocuments({ status: "approved" }),
        FbReviewSubmission.countDocuments({ status: "approved" }),
        FbCommentSubmission.countDocuments({ status: "approved" }),
        GoogleReviewSubmission.countDocuments({ status: "approved" }),
      ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

      // Rejected submissions
      Promise.all([
        Submission.countDocuments({ status: "rejected" }),
        YoutubeSubmission.countDocuments({ status: "rejected" }),
        FbReviewSubmission.countDocuments({ status: "rejected" }),
        FbCommentSubmission.countDocuments({ status: "rejected" }),
        GoogleReviewSubmission.countDocuments({ status: "rejected" }),
      ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

      // Recent submissions (last 30 days)
      Promise.all([
        Submission.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        YoutubeSubmission.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        }),
        FbReviewSubmission.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        }),
        FbCommentSubmission.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        }),
        GoogleReviewSubmission.countDocuments({
          createdAt: { $gte: thirtyDaysAgo },
        }),
      ]).then((counts) => counts.reduce((sum, count) => sum + count, 0)),

      // Top users by submissions
      User.aggregate([
        {
          $lookup: {
            from: "submissions",
            localField: "_id",
            foreignField: "user",
            as: "fbSubmissions",
          },
        },
        {
          $lookup: {
            from: "youtubesubmissions",
            localField: "_id",
            foreignField: "user",
            as: "ytSubmissions",
          },
        },
        {
          $lookup: {
            from: "fbreviewsubmissions",
            localField: "_id",
            foreignField: "user",
            as: "fbReviewSubmissions",
          },
        },
        {
          $lookup: {
            from: "fbcommentsubmissions",
            localField: "_id",
            foreignField: "user",
            as: "fbCommentSubmissions",
          },
        },
        {
          $lookup: {
            from: "googlereviewsubmissions",
            localField: "_id",
            foreignField: "user",
            as: "googleReviewSubmissions",
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            email: 1,
            totalSubmissions: {
              $add: [
                { $size: "$fbSubmissions" },
                { $size: "$ytSubmissions" },
                { $size: "$fbReviewSubmissions" },
                { $size: "$fbCommentSubmissions" },
                { $size: "$googleReviewSubmissions" },
              ],
            },
          },
        },
        { $sort: { totalSubmissions: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalSubmissions,
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        recentSubmissions,
        topUsers,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

// Approve/reject submission from any platform
const updateSubmissionStatus = async (req, res) => {
  try {
    const { submissionId, platformType, status, rejectionReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'approved' or 'rejected'",
      });
    }

    let submission;
    let Model;

    // Determine which model to use based on platform type
    switch (platformType) {
      case "facebook":
        Model = Submission;
        break;
      case "youtube":
        Model = YoutubeSubmission;
        break;
      case "fb-review":
        Model = FbReviewSubmission;
        break;
      case "fb-comment":
        Model = FbCommentSubmission;
        break;
      case "google-review":
        Model = GoogleReviewSubmission;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid platform type",
        });
    }

    submission = await Model.findById(submissionId).populate("user");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    submission.status = status;
    if (rejectionReason) submission.rejectionReason = rejectionReason;

    await submission.save();

    // Update earnings if approved
    if (status === "approved") {
      const Earnings = require("../models/Earnings");
      let earnings = await Earnings.findOne({ user: submission.user._id });

      if (!earnings) {
        earnings = await Earnings.create({
          user: submission.user._id,
          totalEarned: submission.amount || 0,
          availableBalance: submission.amount || 0,
          pendingWithdrawal: 0,
          withdrawnAmount: 0,
        });
      } else {
        earnings.totalEarned += submission.amount || 0;
        earnings.availableBalance += submission.amount || 0;
        await earnings.save();
      }

      // Emit update to user
      const io = req.app.get("io");
      if (io) {
        io.to(submission.user._id.toString()).emit("earningsUpdate", earnings);
      }
    }

    res.json({
      success: true,
      message: `Submission ${status} successfully`,
      data: submission,
    });
  } catch (error) {
    console.error("Update submission error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update submission",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSubmissions,
  getSubmissionStats,
  updateSubmissionStatus,
};
