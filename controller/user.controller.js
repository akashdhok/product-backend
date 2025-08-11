const User = require("../model/user.model.js");
const Leg = require("../model/leg.model.js")
const generateUsername = require("../utils/username.generator.js")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


exports.registerUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            mobile,
            password,
            dob,
            gender,
            state,
            pincode,
            address,
            sponsorId // sponsor username
        } = req.body;

        const totalUsers = await User.countDocuments();
        let sponsorUser = null;
        let placementUser = null;

        if (totalUsers > 0) {
            if (!sponsorId) {
                return res.status(400).json({ message: "Sponsor username is required" });
            }

            // Sponsor find karo
            sponsorUser = await User.findOne({ username: sponsorId });
            if (!sponsorUser) {
                return res.status(400).json({ message: "Invalid sponsor username" });
            }

            // Placement logic: pehla user jiske partners ka size 0 hai
            placementUser = await User.findOne({ partners: { $size: 0 } }).sort({ _id: 1 });
            if (!placementUser) {
                return res.status(400).json({ message: "No eligible placement found" });
            }
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
            sponsorId: sponsorUser ? sponsorUser.username : null,
            sponsorName: sponsorUser ? `${sponsorUser.firstName} ${sponsorUser.lastName}` : null,
            parentId: placementUser ? placementUser._id : null
        });

        await newUser.save();

        // Agar pehla user nahi hai
        if (sponsorUser && placementUser) {

            if (sponsorUser._id.toString() === placementUser._id.toString()) {
                // Same user — ek hi push
                await User.findByIdAndUpdate(sponsorUser._id, {
                    $push: { partners: newUser._id }
                });
            } else {
                // Alag users — dono me push
                await User.findByIdAndUpdate(sponsorUser._id, {
                    $push: { partners: newUser._id }
                });

                await User.findByIdAndUpdate(placementUser._id, {
                    $push: { partners: newUser._id }
                });
            }

            // Level chain update
            let currentUpline = placementUser._id;
            while (currentUpline) {
                await User.findByIdAndUpdate(currentUpline, {
                    $push: { level: newUser._id }
                });

                const uplineUser = await User.findById(currentUpline).select("parentId");
                if (!uplineUser || !uplineUser.parentId) break;
                currentUpline = uplineUser.parentId;
            }

            // Leg create
            await Leg.create({
                userId: newUser._id,
                parentId: placementUser._id,
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