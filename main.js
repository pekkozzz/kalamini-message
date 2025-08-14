require('dotenv').config();
const schedule = require('node-schedule');
const { getChatMembers, updateBitableRecords, findTodayDutyMemberInBitable, sendDutyMessage } = require('./utils/feishu_helper');
const { generateMonthlyRoster } = require('./services/schedule_service');

const { APP_ID, APP_SECRET, CHAT_ID, BITABLE_APP_TOKEN, BITABLE_TABLE_ID } = process.env;

// --- 配置检查 ---
const requiredConfigs = { APP_ID, APP_SECRET, CHAT_ID, BITABLE_APP_TOKEN, BITABLE_TABLE_ID };
for (const [key, value] of Object.entries(requiredConfigs)) {
    if (!value) {
        console.error(`[错误] 缺少必要的环境变量: ${key}，请检查您的 .env 文件。`);
        process.exit(1); // 缺少配置则直接退出
    }
}

/**
 * 每月1号执行，更新整个月的值日表
 */
async function updateMonthlyDutyRoster() {
    console.log('开始执行每月值日表更新任务 (多维表格)...');
    const members = await getChatMembers(CHAT_ID);
    if (members.length > 0) {
        const roster = generateMonthlyRoster(members);
        await updateBitableRecords(BITABLE_APP_TOKEN, BITABLE_TABLE_ID, roster);
        console.log('每月值日表更新任务完成。');
    } else {
        console.log('无法获取群成员，跳过此次值日表更新。');
    }
}

/**
 * 每天9点执行，发送值日提醒
 */
async function sendDailyDutyNotification() {
    console.log('开始执行每日值日提醒任务 (多维表格)...');
    const member = await findTodayDutyMemberInBitable(BITABLE_APP_TOKEN, BITABLE_TABLE_ID);
    if (member) {
        await sendDutyMessage(CHAT_ID, member);
        console.log('每日值日提醒任务完成。');
    } else {
        console.log('今天没有找到值日人员，跳过提醒。');
    }
}

// --- 定时任务调度 ---

// 每月1号凌晨1点执行
schedule.scheduleJob('0 1 1 * *', () => {
    updateMonthlyDutyRoster();
});

// 每天上午9点执行
schedule.scheduleJob('0 9 * * *', () => {
    sendDailyDutyNotification();
});

console.log('飞书值日机器人已启动 (多维表格版)，等待定时任务触发...');

// 为了方便测试，我们可以在启动时立即执行一次
// updateMonthlyDutyRoster();
// sendDailyDutyNotification();