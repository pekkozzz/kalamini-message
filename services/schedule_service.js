/**
 * 为指定月份生成适用于多维表格的值日表记录
 * @param {Array<any>} members 群成员列表
 * @returns {Array<object>} 记录对象数组
 */
function generateMonthlyRoster(members) {
    if (!members || members.length === 0) {
        console.log('没有成员可以参与排班。');
        return [];
    }

    const rosterRecords = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const memberIndex = (day - 1) % members.length;
        const member = members[memberIndex];
        
        // 生成 Unix 时间戳 (毫秒)
        const date = new Date(year, month, day).getTime();
        
        rosterRecords.push({
            '日期': date,
            // "人员"字段需要传入一个包含 id 的对象数组
            '负责人': [{ id: member.member_id }],
        });
    }

    return rosterRecords;
}

module.exports = {
    generateMonthlyRoster,
};