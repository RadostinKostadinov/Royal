import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../app.js';
import { User } from '../model/user.js';
import { BannedIp, SafeIp } from '../model/ip.js';
import bcrypt from 'bcryptjs/dist/bcrypt.js';
import { Product } from '../model/product.js';
let should = chai.should();

chai.use(chaiHttp);

await User.deleteMany({});

const adminPin = await bcrypt.hash("1234", 10);
const admin = new User({
    name: "Admin",
    pin: adminPin,
    role: "admin"
});
let adminToken;
await admin.save();

const safeIp = new SafeIp({ ip: '::ffff:127.0.0.1' });
await safeIp.save();

describe('Products', () => {
    it('/getAllProducts (also login as admin for next tests)', (done) => {
        const login = {
            id: admin._id.toString(),
            pin: "1234"
        }

        chai.request(app)
            .post('/login')
            .send(login)
            .end((err, res) => {
                // Login
                res.should.have.status(200);
                adminToken = res.body.token;

                // Clear products
                Product.deleteMany({}, (err) => {

                    chai.request(app)
                        .get('/getAllProducts')
                        .set('authorization', adminToken)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('array');
                            done();
                        });
                });
            });
    });
});

