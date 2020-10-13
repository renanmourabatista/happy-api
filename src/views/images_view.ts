import Image from "../entities/Image"

export default {
    render(image: Image) {
        return {
            id: image.id,
            path: `${process.env.URL_API}/uploads/${image.path}`,
        }
    },

    renderMany(image: Image[]) {
        return image.map(image => this.render(image));
    }
}