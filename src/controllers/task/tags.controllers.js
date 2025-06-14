const { sqlQuery } = require('../../Modules/sqlHandler');


module.exports = (dependencies) => {
    return {
        addTag: async (req, res) => {
            const { tag_name } = req.body;
            console.log("req", req.data);
            console.log(req.body);

            if (!tag_name) {
                return res.status(400).json({ success: false, message: 'tag_name is required' });
            }
            try {
                const result = await sqlQuery(`INSERT IGNORE INTO db_task_tags (tag_name) VALUES (?) `, [tag_name]);
                if (result)
                    return res.status(200).json({ success: true, message: `Tag ${tag_name} added successfully`, data: result });
                return res.status(500).json({ success: false, message: "something Went wrong While SQL Query", data: [] });

            } catch (error) {
                console.error('Error sending msg:', error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        removeTag: async (req, res) => {
            const { tag_name } = req.params;
            console.log("req.params", req.params);

            try {
                const result = await sqlQuery(`DELETE FROM db_task_tags WHERE tag_name = ?`, [tag_name]);
                if (result)
                    return res.status(200).json({ success: true, message: `Tag ${tag_name} removed successfully`, data: result });
                return res.status(500).json({ success: false, message: "something Went wrong While SQL Query", data: [] });

            } catch (error) {
                console.error('Error sending msg:', error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        getTags: async (req, res) => {
            try {
                const { search = "" } = req.query;
                const result = await sqlQuery(`SELECT * FROM db_task_tags WHERE tag_name LIKE ?`, [`%${search}%`]);
                if (result)
                    return res.status(200).json({ success: true, message: 'Tags fetched successfully!', data: result });
                return res.status(500).json({ success: false, message: "something Went wrong While SQL Query", data: [] });
            } catch (error) {
                console.error('Error sending msg:', error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        getTasksByTag: async (req, res) => {
            const { tag_name } = req.params;
            const { search = "", page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            if (!tag_name) {
                return res.status(400).json({ success: false, message: 'tag_name is required' });
            }
            try {
                var result = [];
                var totalCount = [];
                if (search != "") {
                    result = await sqlQuery(`SELECT * FROM db_tasks WHERE title LIKE ? AND tag_name = ? LIMIT ? OFFSET ?;`, [`%${search}%`, tag_name || '', limit, offset]);
                    totalCount = await sqlQuery(`SELECT count(1) as count FROM db_tasks WHERE title LIKE ? AND tag_name = ?;`, [`%${search}%`, tag_name || '']);
                } else {
                    result = await sqlQuery(`SELECT * FROM db_tasks WHERE tag_name = ? LIMIT ? OFFSET ?;`, [tag_name || '', limit, offset]);
                    totalCount = await sqlQuery(`SELECT count(1) as count FROM db_tasks WHERE tag_name = ?;`, [tag_name || '']);
                }

                if (result.length > 0) {
                    result[result.length - 1].haveMore = totalCount[0].count > offset + limit;
                    result[result.length - 1].totalCount = totalCount[0].count;
                }

                if (result)
                    return res.status(200).json({ success: true, message: 'Tasks fetched successfully!', data: result });
                return res.status(500).json({ success: false, message: "something Went wrong While SQL Query", data: [] });
            } catch (error) {
                console.error('Error sending msg:', error);
                res.status(500).json({ success: false, message: error.message });
            }
        },
        getTagsByUserID: async (req, res) => {
            const { search = '', page = 1, limit = 10 } = req.query;
            const { userID } = req.params;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            const _limit = parseInt(limit);

            try {
                const tags = await sqlQuery(
                    `SELECT DISTINCT tt.*
                        FROM (
                            SELECT t.tag_name
                            FROM db_tasks t
                            JOIN db_task_assignments ta ON ta.task_id = t.taskID
                            WHERE (ta.assigned_to = ? OR ta.assigned_by = ?)
                            AND t.tag_name LIKE CONCAT('%', ?, '%')
                        ) AS user_tasks
                        JOIN db_task_tags tt ON tt.tag_name = user_tasks.tag_name
                        LIMIT ? OFFSET ?`,
                    [userID, userID, search, _limit, offset]
                );

                const totalCount = await sqlQuery(
                    `SELECT COUNT(DISTINCT tt.tag_name) AS count
                            FROM (
                            SELECT t.tag_name
                            FROM db_tasks t
                            JOIN db_task_assignments ta ON ta.task_id = t.taskID
                            WHERE (ta.assigned_to = ? OR ta.assigned_by = ?)
                            AND t.tag_name LIKE CONCAT('%', ?, '%')
                        ) AS user_tasks
                        JOIN db_task_tags tt ON tt.tag_name = user_tasks.tag_name`,
                    [userID, userID, search]
                );

                if (tags.length > 0) {
                    tags[tags.length - 1].haveMore = totalCount[0].count > offset + _limit;
                    tags[tags.length - 1].totalCount = totalCount[0].count;
                }

                if (tags.length === 0) {
                    res.status(400).json({ success: false, message: 'Tags not found' });
                } else {
                    res.status(200).json({ success: true, message: 'Tags fetched successfully!', data: tags });
                }
            } catch (error) {
                console.error('Error Fetching tags:', error);
                res.status(500).json({ success: false, message: error.message });
            }




        }
    }
}
