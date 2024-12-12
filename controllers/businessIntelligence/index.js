const { getRolePermissionsByRoleName } = require("../../utils/dashboardUtils");

const getInsights = async (req, res) => {
    const [adminRoleData] = await getRolePermissionsByRoleName('admin') || [{}];
    const query = {};

    //If user is admin, show list by orgId
    if (role.toLowerCase() === adminRoleData.roleName.toLowerCase()) {
        query.orgId = orgId;
    } else {
        query.id = id;
    }


}

module.exports = {
    getInsights
}