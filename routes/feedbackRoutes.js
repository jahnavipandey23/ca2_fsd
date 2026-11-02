const express = require("express");
const mongoose = require("mongoose");
const Feedback = require("../models/Feedback");
const router = express.Router();
router.post("/", async (req, res, next) => {
    try {
        const { studentName, courseName, message, rating } = req.body;

        if (
            typeof studentName !== "string" || !studentName.trim() ||
            typeof courseName !== "string" || !courseName.trim() ||
            typeof message !== "string" || !message.trim() ||
            rating === undefined || rating === null || rating === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "studentName, courseName, message and rating are required"
            });
        }
        if (
            typeof rating !== "number" ||
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }
        const feedback = await Feedback.create({
            studentName: studentName.trim(),
            courseName: courseName.trim(),
            message: message.trim(),
            rating
        });

        return res.status(201).json({
            success: true,
            message: "Feedback submitted successfully",
            feedback
        });
    } catch (error) {
        next(error);
    }
});

router.get("/", async (req, res, next) => {
    try {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 5);

        if (
            !Number.isInteger(page) || !Number.isInteger(limit) ||
            page < 1 || limit < 1 || limit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Page must be a positive integer and limit must be between 1 and 100"
            });
        }
        const skip=(page-1) * limit;

        const [feedback, totalRecords] = await Promise.all([
            Feedback.find()
                .sort({ createdAt:-1,_id: -1 })
                .skip(skip)
                .limit(limit),
            Feedback.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            pagination: {
                currentPage: page,
                limit,
                totalRecords,
                totalPages: Math.ceil(totalRecords / limit)
            },
            count: feedback.length,
            feedback
        });
    } catch (error) {
        next(error);
    }
});

router.patch("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reviewStatus } = req.body;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid feedback ID"
            });
        }
        if (!["Pending", "Reviewed"].includes(reviewStatus)) {
            return res.status(400).json({
                success: false,
                message: "reviewStatus must be Pending or Reviewed"
            });
        }
        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { $set: { reviewStatus } },
            { new: true, runValidators: true }
        );
        if (!feedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback record not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Feedback status updated successfully",
            feedback
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
