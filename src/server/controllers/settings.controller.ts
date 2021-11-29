import express from 'express';
import asyncMiddleware from '@server/middleware/async.middleware';
import { getManager, getRepository, In } from 'typeorm';
import SiteSettings from '@server/models/site-settings.model';
import _ from 'lodash';
import * as yup from 'yup';
import { getEnhancedRepository } from '@server/common/orm-helpers';
import authMiddleware from '@server/middleware/auth.middleware';

const app = express();

app.get('/settings', authMiddleware(), asyncMiddleware(async (req, res) => {
  const settingsRepository = getRepository(SiteSettings);
  const settings = await settingsRepository.find();
  res.send(settings);
}));

app.post('/settings', authMiddleware(), asyncMiddleware(async (req, res) => {
  const settingsRepository = getRepository(SiteSettings);
  let settings = await settingsRepository.findOne({
    where: {
      key: req?.body?.key
    }
  });
  if (settings) {
    settings.value = req?.body?.value;
    await settingsRepository.save(settings);
  } else {
    settings = await settingsRepository.save({
      key: req?.body?.key,
      value: req?.body?.value
    });
  }
  res.send(settings);
}));

app.get(
  '/settings/main',
  asyncMiddleware(async (req, res) => {
    const settingsRepository = getRepository(SiteSettings);

    const settings = await settingsRepository.find({
      where: {
        key: In(['adminEmail']),
      },
    });

    res.send(_.mapValues(_.keyBy(settings, 'key'), 'value'));
  })
);

app.post(
  '/settings/main',
  asyncMiddleware(async (req, res) => {
    await req.validate({
      adminEmail: yup.string().email().required().label('Email'),
    });

    const { adminEmail } = req.body;

    await getManager().transaction(async (entityManager) => {
      const settingsRepository = getEnhancedRepository(SiteSettings, entityManager);

      const [adminEmailEntity] = await Promise.all([
        settingsRepository.findOneOrCreate({ where: { key: 'adminEmail' } }),
      ]);

      adminEmailEntity.value = adminEmail;

      await settingsRepository.save([adminEmailEntity]);
    });

    res.send();
  })
);

export default app;
