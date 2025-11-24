'use strict'
var Producto = require("../models/producto");
var path = require('path');
var fs = require('fs');

var controller = {
    home: function (req, res) {
        return res.status(200).send(
            "<h1> Hola Mundo </h1>"
        );
    },
    saveProducto: function (req, res) {
        var producto = new Producto();
        var params = req.body;

        producto.marca = params.marca;
        producto.modelo = params.modelo;
        producto.ram = params.ram;
        producto.rom = params.rom
        producto.precio = params.precio;
        producto.imagen = null;

        //save() tambien devuelve una promesa
        producto.save()
            .then(productoStored => {
                if (!productoStored) return res.status(400).send({ message: 'No se ha guardado el producto' });
                return res.status(200).send({ producto: productoStored });
            })
            .catch(err => {
                return res.status(500).send({ message: 'Error al guardar', error: err });
            });

    },

    getProductos: function (req, res) {
        Producto.find({}).sort().exec()
            .then(productos => {
                if (!productos || productos.length === 0)
                    return res.status(404).send({ message: 'No hay producto para mostrar' });
                return res.status(500).send({ productos});
            })
            .catch(err => {
                return res.status(500).send({ message: 'Error al recuperar datos', error: err });
            });
    },

    getProducto: function (req, res) {
        var productoId = req.params.id;

        Producto.findById(productoId)//findById  tambien devuelve unapromesa 
            .then(producto => {
                if (!producto) returnres.status(404).send({ message: 'Elproducto no exite' });
                return res.status(200).send({ producto });
            })
            .catch(err => {
                //Moongose puede lanzar un CastError si el ID no es valido 
                if (err.name === 'CastError') {
                    return res.status(404).send({ producto });
                }
                return res.status(500).send({ message: 'Error alrecuperar  los datos', eror: err });
            });
    },

    deleteProducto: function (req, res) {
        var productoId = req.params.id;
        //Moongose recomienda findByIdAndDelete en lugar definByIdAndRemove ya que seeliminaria toda la logica
        Producto.findByIdAndDelete(productoId)
            .then(productoRemoved => {
                if (!productoRemoved)
                    return res.status(404).send({ message: 'Nose pudeeliminarelproductopor que no existe ' });
                return res.status(200).send({ producto: productoRemoved, message: 'Producto eliminado correctamente' });
            })
            .catch(err => {
                if (err.name === 'CastError') {
                    return res.status(404).send({ message: 'Formato de IDdeproducto no valido para eliminar' });
                }
                return res.status(500).send({ message: 'Error al eliminar los datos', error: err });
            });
    },
    updateProducto: function (req, res) {
        var productoId = req.params.id;
        var update = req.body;
        Producto.findByIdAndUpdate(productoId, update, { new: true })
            .then(productoUpdate => {
                if (!productoUpdate) return res.status(404).send({ message: 'el productp no existe para actualizar' });
                return res.status(200).send({ producto: productoUpdate });
            })
            .catch(err => {
                if (err.name === 'CastError') {
                    return res.status(404).send({ message: 'Formato de ID deproducto no valido para actualizar' });
                }
                return res.status(500).send({ message: 'Erroral actualizarlosdatos', error: err });
            });
    },
    uploadImagen: function (req, res) {
        var prodcutoId = req.params.id;
        var fileName = 'Imagen no subida...';

        if (req.files) {
            var filePath = req.files.imagen.path;
            var file_split = filePath.split('\\');
            var fileName = file_split[file_split.length - 1];

            var extSplit = fileName.split('\.');
            var fileExt = extSplit[extSplit.length - 1];

            if (fileExt == 'png' || fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'gif') {
                Producto.findByIdAndUpdate(prodcutoId, { imagen: fileName }, { new: true })
                    .then(productoUpdate => {
                        if (!productoUpdate) {
                            //eliminar archivo tempral si no ser encuentra elproducto 
                            fs.unlink(filePath, unlinkErr => {
                                return res.status(404).send({ message: 'Elproducto no existe y no se subio la imagen' });
                            });
                        }else{
                            returnres.status(200).send({producto: productoUpdate});
                        }
                    })
                    .catch(err=> {
                        //Eliminararchivotemporalsi hay error DB
                        fs.unlink(filePath, (unlinkErr)=>{
                            if (unlinkErr) console.error('Erroraleliminar archivotemporal;',unlinkErr);
                            if (error.name=== 'CastError'){
                                return res.status(404).send({message:'FormatoID deproducto no valid para subir laimagen'});

                            }
                            return res.status(500).send({message:'Error alsubirlaimageno alactualizar el producto'});
                        });
                    });
            }else{
                fs.unlink(filePath,(err)=>{
                    if(err) console.error('Error aleliminararchivocon extension no valida:', err);
                    return res.status(200).send({massage:'No se ha subido ninguna imagen'})
                });
            }
        }

    },
   getImagen: function (req, res) {
        var file = req.params.imagen;
        var path_file = './uploads/' + file;
        fs.exists(path_file, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(404).send({ message: 'No existe la imagen' });
            }
        });
    }
}
module.exports = controller;


