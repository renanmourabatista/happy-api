import { getRepository } from 'typeorm';
import Orphanage from '../entities/Orphanage';
import orphanageView from '../views/orphanages_view';
import * as Yup from 'yup';

import { Request, Response } from 'express';

export default {

    async list(request: Request, response: Response) {
        const orphanagesRepository = getRepository(Orphanage);

        const orphanages = await orphanagesRepository.find({
            relations: ['images']
        });

        return response.json(orphanageView.renderMany(orphanages));
    },

    async get(request: Request, response: Response) {
        const orphanagesRepository = getRepository(Orphanage);

        const { id } = request.params;

        const orphanage = await orphanagesRepository.findOneOrFail(id, { relations: ['images']});

        return response.json(orphanageView.render(orphanage));
    },

    async create(request: Request, response: Response)
    {
        const {
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends
        } = request.body;
    
        const orphanagesRepository = getRepository(Orphanage);

        const requestImages = request.files as Express.Multer.File[];

        const images = requestImages.map(image => {
            return { path : image.filename}
        });

        const data = { 
            name,
            latitude,
            longitude,
            about,
            instructions,
            opening_hours,
            open_on_weekends,
            images
        }

        const schema = Yup.object().shape({
            name: Yup.string().required(),
            latitude: Yup.number().required(),
            longitude: Yup.number().required(),
            about: Yup.string().required().max(300),
            instructions: Yup.string().required(),
            opening_hours: Yup.string().required(),
            open_on_weekends: Yup.boolean().required(),
            images: Yup.array(
                    Yup.object().shape({
                    path: Yup.string().required()
                })
            )
        })

        await schema.validate(data, {
            abortEarly: false
        });
    
        const orphanage = orphanagesRepository.create(data)
    
        await orphanagesRepository.save(orphanage);
    
        response.status(201).send(orphanageView.render(orphanage));
    }
}