const OrganizationUsers = require("../models/OrganizationUsers");
const Organizations = require("../models/Organizations");

const getOrgSpecificUsers = async (userId) => {
    try {
        const OrganizationDetails = await Organizations.findOne({
            $or: [{ userId: userId }, { adminId: userId }],
        });

        let orgUsers = await OrganizationUsers.find({
            orgId: OrganizationDetails._id,
        });
        orgUsers = orgUsers.map((usr) => usr.userId);
        return orgUsers;
    } catch (err) {
        return false;
    }
};

module.exports = getOrgSpecificUsers;
