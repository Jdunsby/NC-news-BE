process.env.NODE_ENV = 'test';

const app = require('../app');
const request = require('supertest')(app);
const { expect } = require('chai');
const seedDB = require('../db/seed/seed');
const { topicData, userData, articleData, commentData } = require('../db/seed/testData');

describe('API - ARTICLES', () => {
  let topicDocs, userDocs, articleDocs;
  beforeEach(() => {
    return seedDB(userData, topicData, articleData, commentData)
      .then(docs => {
        [ topicDocs, userDocs, articleDocs ] = docs;
      })
      .catch(console.error);
  });

  describe('GET /api/articles', () => {
    it('responds with all articles', () => {
      return request
        .get('/api/articles')
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.key('articles');
          expect(body.articles).to.be.an('array');
          expect(body.articles).to.have.lengthOf(articleDocs.length);
          const [ testArticle ] = body.articles;
          expect(testArticle).to.include.all.keys('_id', 'title', 'body', 'votes', 'created_at', 'belongs_to', 'created_by', 'comment_count', 'topic');
          expect(testArticle._id).to.equal(`${articleDocs[0]._id}`);
          expect(testArticle.title).to.equal(articleDocs[0].title);
          expect(testArticle.body).to.equal(articleDocs[0].body);
          expect(testArticle.votes).to.equal(articleDocs[0].votes);
          expect(testArticle.belongs_to).to.equal(topicDocs[0].slug);
          expect(testArticle.topic).to.be.an('object');
          expect(testArticle.topic._id).to.equal(`${topicDocs[0]._id}`);
          expect(testArticle.topic.slug).to.equal(topicDocs[0].slug);
          expect(testArticle.topic.fa_icon).to.equal(topicDocs[0].fa_icon);
          expect(testArticle.created_by).to.equal(userDocs[0].username);
        });
    });
  });

  describe('GET /api/articles/:article_id', () => {
    it('responds with the requested article', () => {
      return request
        .get(`/api/articles/${articleDocs[0]._id}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.key('article');
          expect(body.article).to.be.an('object');
          expect(body.article).to.include.all.keys('_id', 'title', 'body', 'votes', 'created_at', 'belongs_to', 'created_by', 'comment_count', 'topic');
          expect(body.article._id).to.equal(`${articleDocs[0]._id}`);
          expect(body.article.title).to.equal(articleDocs[0].title);
          expect(body.article.body).to.equal(articleDocs[0].body);
          expect(body.article.votes).to.equal(articleDocs[0].votes);
          expect(body.article.belongs_to).to.equal(topicDocs[0].slug);
          expect(body.article.topic).to.be.an('object');
          expect(body.article.topic._id).to.equal(`${topicDocs[0]._id}`);
          expect(body.article.topic.slug).to.equal(topicDocs[0].slug);
          expect(body.article.created_by).to.equal(userDocs[0].username);
        });
    });

    it('Error: responds with a 400 error when request contains an invalid article_id', () => {
      return request
        .get('/api/articles/golf')
        .expect(400)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('CastError');
          expect(body.message).to.equal('Cast to ObjectId failed for value "golf" at path "_id" for model "articles"');
        });
    });

    it('Error: responds with a 404 error when passed a valid article_id that doesn`t exist', () => {
      return request
        .get('/api/articles/507f191e810c19729de860ea')
        .expect(404)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(404);
          expect(body.error).to.equal('Not Found');
          expect(body.message).to.equal('Article not found');
        });
    });
  });

  describe('GET /api/topics/:topic_slug/articles', () => {
    it('responds with articles belonging to the specified topic', () => {
      return request
        .get(`/api/topics/${topicDocs[1].slug}/articles`)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.key('articles');
          expect(body.articles).to.be.an('array');
          expect(body.articles).to.have.lengthOf(2);
          const testArticle = body.articles[0];
          expect(testArticle).to.include.all.keys('_id', 'title', 'body', 'votes', 'created_at', 'belongs_to', 'created_by', 'comment_count', 'topic');
          expect(testArticle._id).to.equal(`${articleDocs[2]._id}`);
          expect(testArticle.title).to.equal(articleDocs[2].title);
          expect(testArticle.body).to.equal(articleDocs[2].body);
          expect(testArticle.votes).to.equal(articleDocs[2].votes);
          expect(testArticle.belongs_to).to.equal(topicDocs[1].slug);
          expect(testArticle.topic).to.be.an('object');
          expect(testArticle.topic._id).to.equal(`${topicDocs[1]._id}`);
          expect(testArticle.topic.slug).to.equal(topicDocs[1].slug);
          expect(testArticle.created_by).to.equal(userDocs[0].username);
        });
    });

    it('Error: responds with a 404 error when passed a topic_slug that doesn`t exist', () => {
      return request
        .get('/api/topics/knitting/articles')
        .expect(404)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(404);
          expect(body.error).to.equal('Not Found');
          expect(body.message).to.equal('Articles not found for topic: knitting');
        });
    });
  });

  describe('GET /api/users/:username/articles', () => {
    it('responds with articles belonging to the specified topic', () => {
      return request
        .get(`/api/users/${userDocs[1].username}/articles`)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.key('articles');
          expect(body.articles).to.be.an('array');
          expect(body.articles).to.have.lengthOf(2);
          const testArticle = body.articles[0];
          expect(testArticle).to.include.all.keys('_id', 'title', 'body', 'votes', 'created_at', 'belongs_to', 'created_by', 'comment_count', 'topic');
          expect(testArticle._id).to.equal(`${articleDocs[1]._id}`);
          expect(testArticle.title).to.equal(articleDocs[1].title);
          expect(testArticle.body).to.equal(articleDocs[1].body);
          expect(testArticle.votes).to.equal(articleDocs[1].votes);
          expect(testArticle.belongs_to).to.equal(topicDocs[0].slug);
          expect(testArticle.topic).to.be.an('object');
          expect(testArticle.topic._id).to.equal(`${topicDocs[0]._id}`);
          expect(testArticle.topic.slug).to.equal(topicDocs[0].slug);
          expect(testArticle.created_by).to.equal(userDocs[1].username);
        });
    });

    it('Error: responds with a 404 error when passed a topic_slug that doesn`t exist', () => {
      return request
        .get('/api/users/bob/articles')
        .expect(404)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(404);
          expect(body.error).to.equal('Not Found');
          expect(body.message).to.equal('Articles not found for user: bob');
        });
    });
  });


  describe('POST /api/topics/:topic_slug/articles', () => {
    it('responds with the successfully posted article', () => {
      const newArticle = {
        title: 'The first of many API posts',
        body: 'Don`t forget to handle your errors!',
        created_by: `${userDocs[0].username}`
      };
      return request
        .post(`/api/topics/${topicDocs[0].slug}/articles`)
        .send(newArticle)
        .expect(201)
        .then(({ body }) => {
          expect(body).to.have.key('article');
          expect(body.article).to.be.an('object');
          expect(body.article).to.include.keys('_id', 'title', 'body', 'votes', 'created_at', 'belongs_to', 'created_by', 'comment_count', 'topic');
          expect(body.article.title).to.equal(newArticle.title);
          expect(body.article.body).to.equal(newArticle.body);
          expect(body.article.votes).to.equal(0);
          expect(body.article.belongs_to).to.equal(`${topicDocs[0]._id}`);
          expect(body.article.topic).to.be.an('object');
          expect(body.article.topic._id).to.equal(`${topicDocs[0]._id}`);
          expect(body.article.topic.slug).to.equal(topicDocs[0].slug);
          expect(body.article.created_by).to.equal(userDocs[0].username);          
        });
    });

    it('Error: responds with a 404 error when passed a topic_slug that doesn`t exist', () => {
      const newArticle = {
        title: 'The third of many API posts',
        body: 'Don`t forget to handle your errors!',
        created_by: `${userDocs[0].username}`
      };
      return request
        .post('/api/topics/fishing/articles')
        .send(newArticle)
        .expect(404)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(404);
          expect(body.error).to.equal('Not Found');
          expect(body.message).to.equal('Topic with slug fishing does not exist');
        });
    });

    it('Error: responds with a 400 error when request body has no title property', () => {
      const newArticle = {
        body: 'Don`t forget to handle your errors!',
        created_by: `${userDocs[0].username}`
      };
      return request
        .post('/api/topics/cats/articles')
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('Bad Request');
          expect(body.message).to.equal('Request body must contain valid title, body and created_by properties');
        });
    });
    
    it('Error: responds with a 400 error when request body has no body property', () => {
      const newArticle = {
        title: 'The third of many API posts',
        created_by: `${userDocs[0].username}`
      };
      return request
        .post('/api/topics/mitch/articles')
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('Bad Request');
          expect(body.message).to.equal('Request body must contain valid title, body and created_by properties');
        });
    });

    it('Error: responds with a 400 error when request body has no created_by property', () => {
      const newArticle = {
        title: 'The third of many API posts',
        body: 'Don`t forget to handle your errors!'
      };
      return request
        .post(`/api/topics/${topicDocs[0]._id}/articles`)
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('Bad Request');
          expect(body.message).to.equal('Request body must contain valid title, body and created_by properties');
        });
    });
    
    it('Error: responds with a 400 error when request body`s created_by property is not a string', () => {
      const newArticle = {
        title: 'The third of many API posts',
        body: 'Don`t forget to handle your errors!',
        created_by: 5
      };
      return request
        .post(`/api/topics/${topicDocs[0]._id}/articles`)
        .send(newArticle)
        .expect(400)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('Bad Request');
          expect(body.message).to.equal('Request body\'s created_by property must be a string');
        });
    });

    it('Error: responds with a 404 error when request body`s created_by property is a valid username but does not refer to an existing user', () => {
      const newArticle = {
        title: 'The third of many API posts',
        body: 'Don`t forget to handle your errors!',
        created_by: 'tesla'
      };
      return request
        .post('/api/topics/mitch/articles')
        .send(newArticle)
        .expect(404)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(404);
          expect(body.error).to.equal('Not Found');
          expect(body.message).to.equal('User with username tesla does not exist');
        });
    });
  });

  describe('PUT /api/articles/:article_id', () => {
    it('increases the specified article`s vote property by 1 when vote query has the value `up`', () => {
      return request
        .put(`/api/articles/${articleDocs[0]._id}?vote=up`)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.key('article');
          expect(body.article).to.be.an('object');
          expect(body.article).to.include.all.keys('_id', 'title', 'body', 'votes', 'created_at', 'belongs_to', 'created_by', 'topic');
          expect(body.article._id).to.equal(`${articleDocs[0]._id}`);
          expect(body.article.title).to.equal(articleDocs[0].title);
          expect(body.article.body).to.equal(articleDocs[0].body);
          expect(body.article.votes).to.equal(articleDocs[0].votes + 1);
          expect(body.article.belongs_to).to.equal(`${topicDocs[0].slug}`);
          expect(body.article.created_by).to.equal(userDocs[0].username);
          return request.get(`/api/articles/${articleDocs[0]._id}`);
        })
        .then(({ body }) => {
          expect(body).to.have.key('article');
          expect(body.article).to.be.an('object');
          expect(body.article).to.include.key('votes');
          expect(body.article.votes).to.equal(articleDocs[0].votes + 1);
        });
    });

    it('decreases the specified article`s vote property by 1 when vote query has the value `down`', () => {
      return request
        .put(`/api/articles/${articleDocs[0]._id}?vote=down`)
        .expect(200)
        .then(({ body }) => {
          expect(body).to.have.key('article');
          expect(body.article).to.be.an('object');
          expect(body.article).to.include.all.keys('_id', 'title', 'body', 'votes', 'created_at', 'belongs_to', 'created_by', 'topic');
          expect(body.article._id).to.equal(`${articleDocs[0]._id}`);
          expect(body.article.title).to.equal(articleDocs[0].title);
          expect(body.article.body).to.equal(articleDocs[0].body);
          expect(body.article.votes).to.equal(articleDocs[0].votes - 1);
          expect(body.article.belongs_to).to.equal(topicDocs[0].slug);
          expect(body.article.created_by).to.equal(userDocs[0].username);
          return request.get(`/api/articles/${articleDocs[0]._id}`);
        })
        .then(({ body }) => {
          expect(body).to.have.key('article');
          expect(body.article).to.be.an('object');
          expect(body.article).to.include.key('votes');
          expect(body.article.votes).to.equal(articleDocs[0].votes - 1);
        });
    });

    it('Error: responds with a 400 error when request query vote has an invalid value', () => {
      return request
        .put(`/api/articles/${articleDocs[0]._id}?vote=left`)
        .expect(400)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('Bad Request');
          expect(body.message).to.equal('Value \'left\' for vote query is invalid. Use \'up\' or \'down\' instead');
        });
    });
    
    it('Error: responds with a 400 error when request query isn`t vote but has a valid value', () => {
      return request
        .put(`/api/articles/${articleDocs[0]._id}?direction=up`)
        .expect(400)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('Bad Request');
          expect(body.message).to.equal('PUT request must include vote query with value \'up\' or \'down\'');
        });
    });
    
    it('Error: responds with a 400 error when request when request doesn`t include vote query', () => {
      return request
        .put(`/api/articles/${articleDocs[0]._id}`)
        .expect(400)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('Bad Request');
          expect(body.message).to.equal('PUT request must include vote query with value \'up\' or \'down\'');
        });
    });


    it('Error: responds with a 400 error when request contains an invalid article_id', () => {
      return request
        .put('/api/articles/tiguan?vote=up')
        .expect(400)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('CastError');
          expect(body.message).to.equal('Cast to ObjectId failed for value "tiguan" at path "_id" for model "articles"');
        });
    });

    it('Error: responds with a 404 error when passed a valid article_id that doesn`t exist', () => {
      return request
        .put('/api/articles/507f191e810c19729de860ea?vote=down')
        .expect(404)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(404);
          expect(body.error).to.equal('Not Found');
          expect(body.message).to.equal('Article not found');
        });
    });
  });

  describe('DELETE /api/articles/:article_id', () => {
    it('responds with status 204 and deletes the specified article', () => {
      return request
        .delete(`/api/articles/${articleDocs[0]._id}`)
        .expect(204)
        .then(() => request.get(`/api/articles/${articleDocs[0]._id}`))
        .then(({body}) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(404);
          expect(body.error).to.equal('Not Found');
          expect(body.message).to.equal('Article not found');
        });
    });

    it('Error: responds with a 400 error when request contains an invalid article_id', () => {
      return request
        .get('/api/articles/touran')
        .expect(400)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(400);
          expect(body.error).to.equal('CastError');
          expect(body.message).to.equal('Cast to ObjectId failed for value "touran" at path "_id" for model "articles"');
        });
    });

    it('Error: responds with a 404 error when passed a valid article_id that doesn`t exist', () => {
      return request
        .get('/api/articles/507f191e810c19729de860ea')
        .expect(404)
        .then(({ body }) => {
          expect(body).to.have.all.keys('statusCode', 'error', 'message');
          expect(body.statusCode).to.equal(404);
          expect(body.error).to.equal('Not Found');
          expect(body.message).to.equal('Article not found');
        });
    });
  });
});