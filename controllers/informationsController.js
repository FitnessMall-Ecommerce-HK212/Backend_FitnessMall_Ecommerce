'use strict';

const firestore = require('../configure/firestore');
const axios = require('axios');
const { token, shop_id } = require('../configure/GHN');

const Information = require('../models/informations');

const addInformation = async (req, res, next) => {
    try {
        if (req.body.receiver === undefined) res.send('Missing receiver value');
        else if (req.body.province === undefined) res.send("Missing Province Value");
        else if (req.body.district === undefined) res.send("Missing District Value");
        else if (req.body.phone === undefined) res.send('Missing phone value');
        else if (req.body.address === undefined) res.send('Missing address value');
        else if (req.params.username === undefined) res.send('Missing username value');
        else {
            const user = await firestore.collection('users')
                .where('username', '==', req.params.username)
                .get();

            var id;
            user.forEach(doc => {
                id = doc.id;
            });

            await firestore.collection('users').doc(id).collection('informations').add({
                'province': req.body.province,
                'district': req.body.district,
                'address': req.body.address,
                'ward': req.body.ward,
                'receiver': req.body.receiver,
                'phone': req.body.phone
            });

            res.send('Add information successfully')
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getAllInformations = async (req, res, next) => {
    try {
        if (req.params.username === undefined) res.send('Missing username value');
        else {
            const Informations = await firestore.collection('users')
                .where('username', "==", req.params.username)
                .get();

            var id;

            Informations.forEach(doc => {
                id = doc.id;
            });

            const data = await firestore.collection('users').doc(id).collection('informations').get();
            const InformationsArray = [];

            if (data.empty) {
                res.status(404).send('No Information record found');
            } else {
                data.forEach(doc => {
                    const information = new Information(
                        doc.id,
                        doc.data().province,
                        doc.data().district,
                        doc.data().ward,
                        doc.data().address,
                        doc.data().phone,
                        doc.data().receiver
                    );
                    InformationsArray.push(information);
                });
                res.send(InformationsArray);
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getInformation = async (req, res, next) => {
    try {
        if (req.params.id === undefined) res.send("Missing ID value");
        else if (req.params.username === undefined) res.send("Missing username value");
        else {
            const id = req.params.id;
            const user = await firestore.collection('users')
                .where('username', '==', req.params.username)
                .get();
            var userid;

            user.forEach(doc => {
                userid = doc.id;
            })

            const Information = await firestore.collection('users')
                .doc(userid)
                .collection('informations')
                .doc(id);

            const data = await Information.get();
            if (!data.exists) {
                res.status(404).send('Information with the given ID not found');
            } else {
                res.send({ id: data.id, ...data.data(), username: req.params.username });
            }
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const updateInformation = async (req, res, next) => {
    try {
        if (req.params.username === undefined) res.send("Missing username value");
        else if (req.params.id === undefined) res.send("Missing ID value");
        else if (req.body.receiver === '') res.send("Receiver cant't null");
        else if (req.body.phone === '') res.send("Phone can't null");
        else if (req.body.address === '') res.send("Address can't null");
        else if (req.body.province === '') res.send("Province can't null");
        else if (req.body.district === '') res.send("District can't null");
        else if (req.body.ward === '') res.send("Ward can't null");
        else {
            const user = await firestore.collection('users')
                .where('username', '==', req.params.username)
                .get();
            var userid;
            const id = req.params.id;

            user.forEach(doc => {
                userid = doc.id;
            });

            const data = req.body;
            await firestore.collection('users')
                .doc(userid)
                .collection('informations')
                .doc(id)
                .update(data);

            res.send('Information record updated successfuly');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const deleteInformation = async (req, res, next) => {
    try {
        if (req.params.username === undefined) res.send("Missing username value");
        else if (req.params.id === undefined) res.send("Missing ID value");
        else {
            const user = await firestore.collection('users')
                .where('username', '==', req.params.username)
                .get();
            var userid;
            const id = req.params.id;

            user.forEach(doc => {
                userid = doc.id;
            });

            await firestore.collection('users')
                .doc(userid)
                .collection('informations')
                .doc(id)
                .delete();

            res.send('Record deleted successfuly');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
}

const getProvince = async (req, res, next) => {
    try {
        const result = await axios({
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            url: 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province'
        });

        if (result.data.code === 200) {
            const data = result.data.data;
            var provinces = [];
            data.forEach(province => {
                provinces.push({
                    "province_id": province.ProvinceID,
                    "province_name": province.ProvinceName
                });
            });
            res.send(provinces);
        } else {
            res.status(500).send("Something went wrong! Please try again");
        }
    } catch (e) {
        res.status(500).send(e);
    }
}

const getDistrict = async (req, res, next) => {
    try {
        if (req.query.province_id === undefined) res.send("Missing Province ID Value");
        else {
            const result = await axios({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token
                },
                url: 'https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district',
                body: {
                    "province_id": req.query.province_id
                }
            });

            if (result.data.code === 200) {
                const data = result.data.data;
                var districts = [];
                data.forEach(district => {
                    districts.push({
                        "province_id": district.ProvinceID,
                        "district_id": district.DistrictID,
                        "district_name": district.DistrictName
                    });
                });
                res.send(districts);
            } else {
                res.status(500).send("Something went wrong! Please try again");
            }
        }
    } catch (e) {
        res.status(500).send(e);
    }
}

const getWard = async (req, res, next) => {
    try {
        if (req.query.district_id === undefined) res.send("Missing District ID Value");
        else {
            const result = await axios({
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token
                },
                url: `https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${req.query.district_id}`
            });

            if (result.data.code === 200) {
                const data = result.data.data;
                var wards = [];
                data.forEach(ward => {
                    wards.push({
                        "district_id": ward.DistrictID,
                        "ward_code": ward.WardCode,
                        "ward_name": ward.WardName
                    });
                });
                res.send(wards);
            } else {
                res.status(500).send("Something went wrong! Please try again");
            }
        }
    } catch (e) {
        res.status(500).send(e);
    }
}

module.exports = {
    addInformation,
    getAllInformations,
    getInformation,
    updateInformation,
    deleteInformation,
    getProvince,
    getDistrict,
    getWard
}