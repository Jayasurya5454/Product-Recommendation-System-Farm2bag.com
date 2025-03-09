const User = require("../models/user");

const createUser = async (req, res) => {
    const { userid, email } = req.body;

    try {
        let user = await User.findOne({ userid });
        console.log(user);
        if (!user) {
            user = new User({
                userid,
                email,
                lastVisit: new Date(),
            });
            await user.save();
            console.log("New user created");

        } else {
            user.lastVisit = new Date();
            await user.save();
        }

        res.status(200).json({ message: "User saved successfully", user });
    } catch (error) {
        console.error("Error creating user:", error);
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
        const user = await User.findOne({ userid });

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
