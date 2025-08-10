const User = require("../model/user.model.js");
const Leg = require("../model/leg.model.js")
const generateUsername = require("../utils/username.generator.js")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
exports.registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, password, dob, gender, state, pincode, address } = req.body;

        const totalUsers = await User.countDocuments();

        let sponsorId = null;
        let parentId = null;

        if (totalUsers > 0) {
            // Find last user with no partner
            const lastUser = await User.findOne({ partners: { $size: 0 } }).sort({ _id: -1 });

            if (!lastUser) {
                return res.status(400).json({ message: "No eligible sponsor found" });
            }

            sponsorId = lastUser._id;
            parentId = lastUser._id;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username: generateUsername(),
            firstName,
            lastName,
            email,
            mobile,
            password: hashedPassword,
            dob,
            gender,
            state,
            pincode,
            address,
            sponsorId,
            parentId
        });

        await newUser.save();

        // If not the first user
        if (sponsorId) {
            // Add to sponsor’s partners
            await User.findByIdAndUpdate(sponsorId, { $push: { partners: newUser._id } });

            // Add to all uplines' level arrays
            let currentUpline = sponsorId;
            while (currentUpline) {
                await User.findByIdAndUpdate(currentUpline, { $push: { level: newUser._id } });

                const uplineUser = await User.findById(currentUpline).select("parentId");
                if (!uplineUser || !uplineUser.parentId) break;
                currentUpline = uplineUser.parentId;
            }

            // Create Leg record
            await Leg.create({
                userId: newUser._id,
                parentId: parentId,
                business: "0"
            });
        }

        res.status(201).json({
            message: "User registered successfully",
            user: newUser
        });

    } catch (error) {
        console.error("Error in registration:", error);
        res.status(500).json({ message: "Server error" });
    }
};


exports.loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || "mysecretkey",
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
};