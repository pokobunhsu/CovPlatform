const Koa = require('koa')
const Router = require('koa-router')
const koaBody = require('koa-body')
var cors = require('koa-cors');
const csvParser = require("csv-parser");
const needle = require("needle");
const app = new Koa()
const router = new Router()
const PORT = process.env.PORT || 3000;

app.use(koaBody());
app.use(cors({
    origin: '*',
    credentials: true
}));

var result = []
var newData = []
var updateTime = ""

router
    .get('/', ctx => {
        ctx.body = { "hello": "world" }
    })
    .get('/selfTest/:country/:index', ctx => {
        let country = ctx.params.country
        let dataindex = ctx.params.index
        let allData = []
        let output = []
        for (let i = 0; i < result.length; i++) {
            const element = result[i];
            if (element.醫事機構地址.indexOf(country) != -1) {
                allData.push(element)
            }
        }
        let endIndex = parseInt(dataindex) + 12
        for (let j = dataindex; j < endIndex; j++) {
            const element2 = allData[j];
            if (element2 != null) {
                output.push(element2)
            }
        }
        ctx.body = output
    })
    .get('/update/selfTest', async ctx => {
        ctx.body = await getData()
    })
    .get('/selfTest/lastUpdate', async ctx => {
        ctx.body = updateTime
    })
app.use(router.routes())

app.listen(PORT, err => {
    if (err) throw err;
    console.log("%c Server running", "color: green");
});



let getData = () => {
    newData.length = 0
    const url = "https://data.nhi.gov.tw/resource/Nhi_Fst/Fstdata.csv";
    return new Promise((resolve, reject) => {
        needle
            .get(url)
            .pipe(csvParser())
            .on("data", (data) => {
                newData.push(data);
            })
            .on("done", (err) => {
                if (err) {
                    console.log("An error has occurred");
                } else {
                    console.log('資料更新成功');
                    result.length = 0
                    result = result.concat(newData)
                    let today = new Date();
                    let yaer = today.getFullYear()
                    let month = today.getMonth() + 1
                    let date = today.getDate()
                    let hour = today.getHours()
                    let minute = today.getMinutes()
                    let second = today.getSeconds()
                    updateTime = `${yaer}/${month.toString().padStart("2", "0")}/${date.toString().padStart("2", "0")} ${hour.toString().padStart("2", "0")}:${minute.toString().padStart("2", "0")}:${second.toString().padStart("2", "0")}`
                    resolve(result)
                }
            })
    })
}


getData()
setInterval(function () {
    getData()
}, 30000)