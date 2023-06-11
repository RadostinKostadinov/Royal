import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../app.js';
import { User } from '../model/user.js';
import { BannedIp, SafeIp } from '../model/ip.js';
import bcrypt from 'bcryptjs/dist/bcrypt.js';
let should = chai.should();

chai.use(chaiHttp);

const adminPin = await bcrypt.hash("1234", 10);
const admin = new User({
    name: "Admin",
    pin: adminPin,
    role: "admin"
});

const waiterPin = await bcrypt.hash("0000", 10);
const waiter = new User({
    name: "Waiter",
    pin: waiterPin,
    role: "waiter"
});

let adminToken;
let waiterToken;


describe('Users', () => {
    // Empty the database before each test
    /* beforeEach((done) => {
        User.deleteMany({}, (err) => {
            done();
        });
    }); */

    describe('/getAllUsers', () => {

        it('it should GET all the users (empty database test)', (done) => {
            // delete all users before test
            User.deleteMany({}, (err) => {
                chai.request(app)
                    .get('/getAllUsers')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        res.body.length.should.be.eq(0); // 0 users since DB is emptied before hand
                        done();
                    });
            });
        });

        it('it should GET all the users (created admin)', (done) => {
            admin.save((err, admin) => {
                chai.request(app)
                    .get('/getAllUsers')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        res.body.length.should.be.eq(1); // 1 users since admin is created before test
                        res.body[0].should.have.property('_id').eql(admin._id.toString()); //check if admin id is returned
                        res.body[0].should.have.property('name').eql(admin.name); // check if username is returned
                        done();
                    });
            });
        });

        it('it should GET all the users (created waiter)', (done) => {
            waiter.save((err, waiter) => {
                chai.request(app)
                    .get('/getAllUsers')
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('array');
                        res.body.length.should.be.eq(2); // 2 users since admin and waiter are created before test
                        res.body[1].should.have.property('_id').eql(waiter._id.toString()); //check if waiter id is returned
                        res.body[1].should.have.property('name').eql(waiter.name); // check if username is returned
                        done();
                    });
            });
        });
    });

    describe('/login', () => {
        it('it should require safeIP password', (done) => {
            const login = {
                id: admin._id.toString(),
                pin: "1234"
            }

            // Delete safeIp before test
            SafeIp.deleteMany({}, (err) => {
                chai.request(app)
                    .post('/login')
                    .send(login)
                    .end((err, res) => {
                        res.should.have.status(401);
                        res.text.should.be.eql('Неразпознат IP адрес!');
                        done();
                    });
            });
        });

        it('it should NOT let you login when you entered too much wrong safeIP password', (done) => {
            // Simulate you are already banned (add ip to ban list)
            const bannedIp = new BannedIp({ ip: '::ffff:127.0.0.1' });

            bannedIp.save((err, bannedIp) => {
                const login = {
                    id: admin._id.toString(),
                    pin: "1234"
                }

                chai.request(app)
                    .post('/login')
                    .send(login)
                    .end((err, res) => {
                        res.status.should.be.eql(403);
                        // Remove bannedIp so it doesn't affect other tests
                        BannedIp.deleteMany({}, (err) => {
                            done();
                        })
                    });
            });
        });

        it('it should NOT login with wrong pin (also enters safeIP password for the other tests)', (done) => {
            const login = {
                id: admin._id.toString(),
                pin: '4512'
            }

            // Create safeIp before test
            const safeIp = new SafeIp({ ip: '::ffff:127.0.0.1' });

            safeIp.save((err, safeIp) => {
                chai.request(app)
                    .post('/login')
                    .send(login)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.text.should.be.eql('Грешен пин');
                        done();
                    });
            });
        });

        it('it should require all login credentials (id and pin)', (done) => {
            const login = {
                id: admin._id.toString()
            }

            chai.request(app)
                .post('/login')
                .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.be.eql('Всички полета са задължителни');
                    done();
                });
        });

        it('it should NOT let you login with wrong id', (done) => {
            const login = {
                id: '123456789012345678901234',
                pin: "1234"
            }

            chai.request(app)
                .post('/login')
                .send(login)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.be.eql('Потребителят не съществува');
                    done();
                });
        });

        it('it should NOT let you login with wrong pin', (done) => {
            const login = {
                id: admin._id.toString(),
                pin: "5152"
            }

            chai.request(app)
                .post('/login')
                .send(login)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.be.eql('Грешен пин');
                    done();
                });
        });

        it('it should login successfully with admin', (done) => {
            const login = {
                id: admin._id.toString(),
                pin: "1234"
            }

            chai.request(app)
                .post('/login')
                .send(login)
                .end((err, res) => {
                    // console.log(res.res);
                    res.should.have.status(200);
                    adminToken = res.body.token;
                    done();
                });
        });

        it('it should login successfully with waiter', (done) => {
            const login = {
                id: waiter._id.toString(),
                pin: "0000"
            }

            chai.request(app)
                .post('/login')
                .send(login)
                .end((err, res) => {
                    // console.log(res.res);
                    res.should.have.status(200);
                    waiterToken = res.body.token;
                    done();
                });
        });
    })

    describe('/createUser', () => {
        it('it should require auth token', (done) => {
            chai.request(app)
                .post('/createUser')
                .end((err, res) => {
                    res.should.have.status(403);
                    res.res.text.should.be.eql('A token is required for authentication');
                    done();
                });
        });

        it('it should NOT create user with invalid auth token', (done) => {
            chai.request(app)
                .post('/createUser')
                .set('authorization', 'invalid token')
                .end((err, res) => {
                    res.should.have.status(401);
                    res.res.text.should.be.eql('Invalid Token');
                    done();
                });
        });

        it('it should NOT create user with auth token of waiter', (done) => {
            chai.request(app)
                .post('/createUser')
                .set('authorization', waiterToken)
                .end((err, res) => {
                    res.should.have.status(401);
                    res.res.text.should.be.eql('Нямате админски достъп!');
                    done();
                });
        });

        it('it should NOT create user with invalid role', (done) => {
            const user = {
                name: 'Test',
                pin: '1234',
                role: 'invalid'
            }

            chai.request(app)
                .post('/createUser')
                .set('authorization', adminToken)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(400);
                    res.text.should.be.eql('Грешна длъжност!');
                    done();
                });
        });

        it('it should NOT create user with existing name', (done) => {
            const user = {
                name: 'Waiter',
                pin: '1234',
                role: 'waiter'
            }

            chai.request(app)
                .post('/createUser')
                .set('authorization', adminToken)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(409);
                    res.text.should.be.eql('Вече има създаден служител с това име!');
                    done();
                });
        });

        it('it should create user successfully', (done) => {
            const user = {
                name: 'Test',
                pin: '1234',
                role: 'waiter'
            }

            chai.request(app)
                .post('/createUser')
                .set('authorization', adminToken)
                .send(user)
                .end((err, res) => {
                    res.should.have.status(201);
                    res.text.should.be.eql('Успешно създаден служител!');
                    done();
                });
        });


        describe('it should NOT create user without all required user properties:', () => {
            it('name', (done) => {
                const user = {
                    name: 'Test',
                    pin: '1234',
                }

                chai.request(app)
                    .post('/createUser')
                    .set('authorization', adminToken)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.text.should.be.eql('Всички полета са задължителни!');
                        done();
                    });
            });

            it('pin', (done) => {
                const user = {
                    name: 'Test',
                    role: 'waiter'
                }

                chai.request(app)
                    .post('/createUser')
                    .set('authorization', adminToken)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.text.should.be.eql('Всички полета са задължителни!');
                        done();
                    });
            });

            it('role', (done) => {
                const user = {
                    name: 'Test',
                    pin: '5123'
                }

                chai.request(app)
                    .post('/createUser')
                    .set('authorization', adminToken)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.text.should.be.eql('Всички полета са задължителни!');
                        done();
                    });
            });
        });

        describe('it should NOT create user when PIN is:', () => {
            it('Too short', (done) => {
                const user = {
                    name: 'Test',
                    pin: '123',
                    role: 'waiter'
                }

                chai.request(app)
                    .post('/createUser')
                    .set('authorization', adminToken)
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.text.should.be.eql('ПИН кодът трябва да е точно 4 числа!');
                        done();
                    });
            });

            it('Too long', (done) => {
                const user = {
                    name: 'Test',
                    pin: '12345',
                    role: 'waiter'
                }

                chai.request(app)
                    .post('/createUser')
                    .set('authorization', adminToken)
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.text.should.be.eql('ПИН кодът трябва да е точно 4 числа!');
                        done();
                    });
            });

            it('NaN', (done) => {
                const user = {
                    name: 'Test',
                    pin: '123a',
                    role: 'waiter'
                }

                chai.request(app)
                    .post('/createUser')
                    .set('authorization', adminToken)
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(400);
                        res.text.should.be.eql('ПИН кодът трябва да е точно 4 числа!');
                        done();
                    });
            });
        });
    });
});