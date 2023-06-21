const {
  Theme
} = require('../db/models');

const themeController = {
  async getThemes() {
    const themes = await Theme.findAll();

    if (!themes) {
      const err = new Error('Themes not found');
      err.statusCode = 404;
      err.status = 404;
      throw err;
    }
    return themes;
  },

};

module.exports = {
  themeController,
};
