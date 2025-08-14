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

    let workDayCounter = 0; // 使用一个独立的工作日计数器来确保排班公平

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay();

        // getDay() 返回值: 0 是周日, 6 是周六
        // 如果是周六或周日，则跳过本次循环
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            continue;
        }

        // 使用工作日计数器来决定负责人，而不是日期
        const memberIndex = workDayCounter % members.length;
        const member = members[memberIndex];
        
        // 生成 Unix 时间戳 (毫秒)
        const date = currentDate.getTime();
        rosterRecords.push({
            '日期': date,
            '负责人': member.name,
            '负责人ID': member.member_id
        });

        workDayCounter++; // 只有在工作日成功排班后，计数器才增加
    }

    return rosterRecords;
}

/**
 * 为本周分配清洁任务
 * @param {Array<any>} members 群成员列表
 * @returns {Array<{task: string, members: Array<{name: string, id: string}>}> | null}
 */
function assignWeeklyTasks(members) {
    const tasks = [
        { name: '办公室外公共区域-- 负责整理归纳和表面清灰', count: 1 },
        { name: '公共区域地面', count: 2 },
        { name: '丢垃圾', count: 1 },
        { name: '寄养区域清洁', count: 1 },
        { name: '全局检查', count: 1 },
    ];

    const totalRequiredMembers = tasks.reduce((sum, task) => sum + task.count, 0);

    if (!members || members.length < totalRequiredMembers) {
        console.error(`[错误] 成员数量不足 ${totalRequiredMembers} 人，无法分配每周任务。`);
        return null;
    }

    // Fisher-Yates shuffle 算法打乱成员数组
    const shuffledMembers = [...members];
    for (let i = shuffledMembers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledMembers[i], shuffledMembers[j]] = [shuffledMembers[j], shuffledMembers[i]];
    }

    const assignments = [];
    let memberIndex = 0;

    for (const task of tasks) {
        const assignedMembers = [];
        for (let i = 0; i < task.count; i++) {
            const member = shuffledMembers[memberIndex++];
            assignedMembers.push({ name: member.name, id: member.member_id });
        }
        assignments.push({
            task: task.name,
            members: assignedMembers,
        });
    }

    return assignments;
}

module.exports = {
    generateMonthlyRoster,
    assignWeeklyTasks,
};