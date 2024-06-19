const cloudinary = require("cloudinary");

const fileUpload = async (img) => {

	const mycloud = await cloudinary.v2.uploader.upload(img);
	return mycloud
}

const fileRemove = async(id) => {
	const success = await cloudinary.v2.uploader.destroy(id);
	return success;

}
module.exports = {fileUpload, fileRemove}