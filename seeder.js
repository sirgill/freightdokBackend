const User = require("./models/User");
const bcrypt = require("bcryptjs");

module.exports = async function() {
    try {
        const email = process.env.ADMIN_EMAIL || 'admin@freightdok.com';
        const pwd = process.env.ADMIN_PWD || 'test12';
        const name = process.env.ADMIN_NAME || 'ADMIN'
        let user = await User.findOne({ email });
        if (user)
            console.log('Admin Exists');
        else {
            user = new User({
                name,
                email,
                role: "admin"
            });
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(pwd, salt);
            await user.save();
            console.log('Admin Created');
        }
    } catch (e) {
        console.log(e.message);
    }
};