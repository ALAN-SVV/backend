'use-strict'
var express=require('express');
var ProductoController=require('../controllers/tienda');

//define rutas esspecificas dentro de la aplicacion 
var router=express.Router();

//subir el archivo multipart/form-data
var multipart=require('connect-multiparty');

var multiPartMiddleware=multipart({uploadDir:'./uploads'});

//pagina de inicio
router.get('/home', ProductoController.home);

//guardar informaacion de prodcuto}
router.post('/guardar-producto', ProductoController.saveProducto);

//ver indormacion de los productos
router.get('/productos', ProductoController.getProductos);

//obtener datos de un producto

router.get('/producto/:id', ProductoController.getProducto);

//eliminar prodcuto

router.delete('/producto/:id', ProductoController.deleteProducto);

//ACTUALIZAR PRODUCTO

router.put('/producto/:id', ProductoController.updateProducto);

//AGREGAR IMAGENES
router.post('/subir-imagen/:id', multiPartMiddleware,ProductoController.uploadImagen);

//CARGAR IMAGENES

router.get('/get-imagen/:imagen', ProductoController.getImagen);


module.exports=router;  // exportar un objeto route desde un modulo de node.js paa utilizarlo en otro archivos 

