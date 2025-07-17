

module.exports = (dependencies) => {
    return async (req, res) => {
        console.log(req.body);
        return res.status(200).json({ status: true, msg: 'success' });
    }
}