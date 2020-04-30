const express = require('express')
const app = express()
const port = 2000
const bodyParser = require('body-parser')
const cors = require('cors')
const db = require('./database')

const fs = require('fs')
const { uploader } = require('./helper/uploader')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
	res.status(200).send('<h1>API ini jalan, anda kaget? sama saya juga</h1>')
})
console.log('Sudah Connect ya')
// dijadikan satu ya
// MENAMBAHKAN PRODUCT
app.post('/add-product', (req, res) => {
    const path = '/images'
    const upload = uploader(path, 'IMG').fields([{ name : 'image' }]);
    upload(req, res, (err) => {
        const { image } = req.files;
        const { nama, harga } = JSON.parse(req.body.data)
        const imagePath = image ? `${path}/${image[0].filename}` : null

        let sql = `insert into product (nama, harga, imagePath) values ('${nama}', ${harga}, '${imagePath}')`
        db.query(sql, req.body, (err, results) => {
            if(err){
                fs.unlinkSync(`./public${imagePath}`)
                res.status(500).send(err.message)
            }
            res.status(200).send
            ({
                status : "success upload",
                message : "data nya masuk"
            })
        })
    })
})


// GET DATA PRODUCT
app.get('/get-product', (req, res) => {
    let sql = `select * from product`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send(results)
    })
})


// EDIT DATA PRODUCT
app.patch('/edit-product/:id', (req, res) => {
    let { id } = req.params
    let sql = `select * from product where product_id = ${id}`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)

        const oldImagePath = results[0].imagePath
        const path = '/images'
        const upload = uploader(path, 'IMG').fields([{ name : 'image' }])
        upload(req, res, (err) => {
            const { image } = req.files;
            const { nama, harga } = JSON.parse(req.body.data)
            const imagePath = image ? `${path}/${image[0].filename}` : null

            let sql = `update product set nama = '${nama}', harga = ${harga}, imagePath = '${imagePath}' where product_id = ${id}`;
            db.query(sql, req.body, (err, update) => {
                if(err){
                    fs.unlinkSync(`./public${imagePath}`)
                    res.status(500).send(err.message)
                }
                if(image){
                    fs.unlinkSync(`./public${oldImagePath}`)
                }
                res.status(200).send ({
                    status : "success edit",
                    message : "data teredit ya"
                })
                })
            })
        })
    })


// INI DELETE
app.delete('/delete-product/:id', (req, res) => {
    let { id } = req.params
    let sql = `select * from product where product_id = ${id}`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)

        const oldImagePath = results[0].imagePath
        let sql = `delete from product where product_id = ${id}`;
        db.query(sql, (err, response) => {
            if(err)res.status(500).send(err.message)
            fs.unlinkSync(`./public${oldImagePath}`)
            res.status(200).send ({
                status : "successful deleted",
                message : "data terdelete"
            })
        })
    })
})


// TAMBAH STORE
app.post('/add-store', (req, res) => {
    let sql = `insert into store set ?`;
    db.query(sql, req.body, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send
        ({
            status : "successful added",
            message : "store terbuat"
        })
    })
})

// LIAT DATA STORE
app.get('/get-store', (req, res) => {
    let sql = `select * from store`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send(results)
    })
})


// EDITT STORE
app.patch('/edit-store/:id', (req, res) => {
    let sql = `update store set ? where store_id = ${req.params.id}`;
    db.query(sql, req.body, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send ({
            status : "successful edited",
            message : "store teredit"
        })
    })
})

//DELETE STORE
app.delete('/delete-store/:id', (req, res) => {
    let sql = `delete from store where store_id = ${req.params.id}`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send ({
            status : "successful deleted",
            message : "store terdelete"
        })
    })
})

// MANAGE INVENTORY
app.post('/add-inventory', (req, res) => {
    let sql = `insert into inventory set ?`;
    db.query(sql, req.body, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send ({
            status : "success tambah data",
            message : "inventory telah dibuat"
        })
    })
})


// inventory dimulai
app.get('/get-inventory', (req, res) => {
    let sql = `select nama as "Product", branch_name as "Branch Name", inventory as "Stock"
    from inventory i
    join product p on 
    i.id_product = p.product_id
    join store s on 
    i.id_store = s.store_id;`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send(results)
    })
})

app.patch('/edit-inventory/:id', (req, res) => {
    let sql = `update inventory set ? where idinventory = ${req.params.id}`;
    db.query(sql, req.body, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send ({
            status : "successful edited",
            message : "inventory teredit"
        })
    })
})

app.delete('/delete-inventory/:id', (req, res) => {
    let sql = `delete from inventory where idinventory = ${req.params.id}`;
    db.query(sql, (err, results) => {
        if(err)res.status(500).send(err.message)
        res.status(200).send ({
            status : "successful deleted",
            message : "inventory sudah terdelete"
        })
    })
})

app.listen(port, () => console.log(`API nya hidup guys di port ${port}`))
