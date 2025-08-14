const client = require('./lark_client');

/**
 * 获取指定群组的成员列表
 * @param {string} chatId 群组ID
 * @returns {Promise<Array<any>>} 成员列表
 */
async function getChatMembers(chatId) {
    try {
        const response = await client.im.chatMembers.get({
            path: { chat_id: chatId },
            params: { member_id_type: 'user_id' },
        });

        if (response.code !== 0) {
            throw new Error(`获取群成员失败: ${response.msg}`);
        }

        // 过滤掉机器人成员
        return response.data.items.filter(member => member.member_type !== 'app');
    } catch (error) {
        console.error('获取群成员时出错:', error);
        return [];
    }
}

/**
 * 更新多维表格内容
 * @param {string} appToken 多维表格的App Token
 * @param {string} tableId 表格的ID
 * @param {Array<any>} records 要写入的记录
 */
async function updateBitableRecords(appToken, tableId, records) {
    try {
        // 1. 清空所有记录
        const listResponse = await client.bitable.appTableRecord.list({
            path: { app_token: appToken, table_id: tableId },
        });
        if (listResponse.code === 0 && listResponse.data.items) {
            const recordIds = listResponse.data.items.map(item => item.record_id);
            if (recordIds.length > 0) {
                await client.bitable.appTableRecord.batchDelete({
                    path: { app_token: appToken, table_id: tableId },
                    data: { records: recordIds },
                });
            }
        }

        // 2. 批量添加新记录
        const response = await client.bitable.appTableRecord.batchCreate({
            path: { app_token: appToken, table_id: tableId },
            data: { records: records.map(r => ({ fields: r })) },
        });

        if (response.code !== 0) {
            throw new Error(`写入多维表格失败: ${response.msg}`);
        }
        console.log('成功将新的值日表写入多维表格。');
    } catch (error) {
        console.error('更新多维表格时出错:', error);
    }
}

/**
 * 从多维表格中查找今日值日人员
 * @param {string} appToken 多维表格的App Token
 * @param {string} tableId 表格的ID
 * @returns {Promise<{name: string, id: string} | null>}
 */
async function findTodayDutyMemberInBitable(appToken, tableId) {
    try {
        const today = new Date();
        // 飞书多维表格日期查询需要的是 Unix 时间戳 (毫秒)
        const todayTimestamp = today.setHours(0, 0, 0, 0);

        const response = await client.bitable.appTableRecord.list({
            path: { app_token: appToken, table_id: tableId },
            params: {
                filter: `CurrentValue.[日期] = ${todayTimestamp}`,
            },
        });

        if (response.code !== 0) {
            throw new Error(`读取多维表格失败: ${response.msg}`);
        }

        if (response.data.items && response.data.items.length > 0) {
            const record = response.data.items[0];
            // 从“人员”字段中提取姓名和ID
            const dutyPerson = record.fields['负责人'][0];
            const name = dutyPerson.name;
            const id = dutyPerson.id;

            console.log(`找到今天的值日同学: ${name}`);
            return { name, id };
        }

        console.log(`没有在多维表格中找到今天的排班记录。`);
        return null;
    } catch (error) {
        console.error('查找今日值日人员时出错:', error);
        return null;
    }
}

/**
 * 在群里发送值日提醒消息
 * @param {string} chatId 群组ID
 * @param {{name: string, id: string}} member 值日成员
 */
async function sendDutyMessage(chatId, member) {
    try {
        const message = `早上好！☀️ 今天的值日同学是 <at user_id="${member.id}">${member.name}</at>，请记得完成值日工作哦！`;

        const response = await client.im.message.create({
            params: { receive_id_type: 'chat_id' },
            data: {
                receive_id: chatId,
                content: JSON.stringify({ text: message }),
                msg_type: 'text',
            },
        });

        if (response.code !== 0) {
            throw new Error(`发送消息失败: ${response.msg}`);
        }
        console.log('成功发送值日提醒消息。');
    } catch (error) {
        console.error('发送值日提醒时出错:', error);
    }
}

module.exports = {
    getChatMembers,
    updateBitableRecords,
    findTodayDutyMemberInBitable,
    sendDutyMessage,
};