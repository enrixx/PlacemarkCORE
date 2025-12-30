import {Placemark} from "./placemark.js";

export const placemarkMongoStore = {
    async getAllPlacemarks() {
        return Placemark.find().lean();
    },

    async getPlacemarkById(id) {
        if (id) {
            return Placemark.findOne({_id: id}).lean();
        }
        return null;
    },

    async addPlacemark(userId, placemark) {
        placemark.userid = userId;
        const newPlacemark = new Placemark(placemark);
        const placemarkObj = await newPlacemark.save();
        return this.getPlacemarkById(placemarkObj._id);
    },

    async getPlacemarksByUserId(id) {
        try {
            return await Placemark.find({userid: id}).lean();
        } catch (error) {
            return [];
        }
    },

    async getPlacemarksByCategoryId(id) {
        try {
            return await Placemark.find({categoryId: id}).lean();
        } catch (error) {
            return [];
        }
    },

    async deletePlacemarkById(id, userId) {
        try {
            const placemark = await Placemark.findOne({_id: id});
            if (!placemark || placemark.userid.toString() !== userId.toString()) {
                return false;
            }
            await Placemark.deleteOne({_id: id});
            return true;
        } catch (error) {
            return false;
        }
    },

    async deleteAllPlacemarks() {
        await Placemark.deleteMany({});
    },

    async updatePlacemark(id, updatedPlacemark) {
        try {
            const placemark = await Placemark.findOne({_id: id});
            if (!placemark) return false;
            placemark.name = updatedPlacemark.name;
            placemark.description = updatedPlacemark.description;
            placemark.latitude = updatedPlacemark.latitude;
            placemark.longitude = updatedPlacemark.longitude;
            placemark.categoryId = updatedPlacemark.categoryId;
            placemark.images = updatedPlacemark.images;

            await placemark.save();
            return true;
        } catch (error) {
            return false;
        }
    },
};
