const User = require("../models/user");

const createUser = async (req, res) => {
    const { userid, email } = req.body;
    console.log("User ID:", userid);
    console.log("Email:", email);
    
    try {
        let user = await User.findOne({ userid });

        if (!user) {
            user = new User({
                userid,
                email,
                lastVisit: new Date(),
            });
            await user.save();
        } else {
            user.lastVisit = new Date();
            await user.save();
        }

        res.status(200).json({ message: "User saved successfully", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const userid = req.params.userid;
        const {
            mobileNumber,
            age,
            gender,
            weight,
            height,
            occupation,
            dietType,
            bmi,
            medicalConditions,
            skinType,
        } = req.body;

        // Find user by userid and update the fields
        const updatedUser = await User.findOneAndUpdate(
            { userid },
            {
                mobileNumber,
                age,
                gender,
                weight,
                height,
                occupation,
                dietType,
                bmi,
                medicalConditions,
                skinType,
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User details updated", user: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Failed to update user details" });
    }
};

const getUser = async (req, res) => {
    try {
        const userid = req.params.userid;
        console.log("User ID:", userid);
        const user = await User.findOne({ userid });
        console.log("User:", user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error getting user:", error);
        res.status(500).json({ message: "Failed to get user" });
    }
};

module.exports = {
    createUser,
    updateUser,
    getUser,
};
