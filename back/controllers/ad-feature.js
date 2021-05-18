const adFeatureModel = require('../models/ad-feature');

class adFeatureController {
    // 查询num条数据
    static async data(ctx) {
        let num = ctx.query.num;
        if (num) {
            try {
                let res = await adFeatureModel.getData(num);
                ctx.response.status = 200;
                ctx.body = {
                    code: 200,
                    msg: 'success',
                    res
                };
            } catch (err) {
                // 412：先决条件失败
                ctx.response.status = 412;
                ctx.body = {
                    code: 412,
                    msg: 'fail',
                    res
                };
            }
        } else {
            // 416：所请求的范围无法满足
            ctx.response.status = 416;
            ctx.body = {
                code: 416,
                msg: 'The param num is necessary'
            };
        }
    }
}

module.exports = adFeatureController;