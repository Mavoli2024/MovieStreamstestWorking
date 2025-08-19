"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
exports.setupAuth = setupAuth;
var passport_1 = require("passport");
var passport_local_1 = require("passport-local");
var express_session_1 = require("express-session");
var crypto_1 = require("crypto");
var util_1 = require("util");
var connect_pg_simple_1 = require("connect-pg-simple");
var storage_1 = require("./storage");
var scryptAsync = (0, util_1.promisify)(crypto_1.scrypt);
// Password hashing utilities
function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var salt, buf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    salt = (0, crypto_1.randomBytes)(16).toString("hex");
                    return [4 /*yield*/, scryptAsync(password, salt, 64)];
                case 1:
                    buf = (_a.sent());
                    return [2 /*return*/, "".concat(buf.toString("hex"), ".").concat(salt)];
            }
        });
    });
}
function comparePasswords(supplied, stored) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, hashed, salt, hashedBuf, suppliedBuf;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = stored.split("."), hashed = _a[0], salt = _a[1];
                    hashedBuf = Buffer.from(hashed, "hex");
                    return [4 /*yield*/, scryptAsync(supplied, salt, 64)];
                case 1:
                    suppliedBuf = (_b.sent());
                    return [2 /*return*/, (0, crypto_1.timingSafeEqual)(hashedBuf, suppliedBuf)];
            }
        });
    });
}
// Setup session store
function getSessionStore() {
    var pgStore = (0, connect_pg_simple_1.default)(express_session_1.default);
    return new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: 7 * 24 * 60 * 60, // 1 week
        tableName: "sessions",
    });
}
function setupAuth(app) {
    var _this = this;
    // Session configuration
    app.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
        resave: false,
        saveUninitialized: false,
        store: getSessionStore(),
        cookie: {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        },
    }));
    // Passport initialization
    app.use(passport_1.default.initialize());
    app.use(passport_1.default.session());
    // Passport local strategy
    passport_1.default.use(new passport_local_1.Strategy({
        usernameField: 'email',
        passwordField: 'password'
    }, function (email, password, done) { return __awaiter(_this, void 0, void 0, function () {
        var user, isValid, _, userWithoutPassword, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, storage_1.storage.getUserByEmail(email)];
                case 1:
                    user = _a.sent();
                    if (!user || !user.password) {
                        return [2 /*return*/, done(null, false, { message: 'Invalid email or password' })];
                    }
                    return [4 /*yield*/, comparePasswords(password, user.password)];
                case 2:
                    isValid = _a.sent();
                    if (!isValid) {
                        return [2 /*return*/, done(null, false, { message: 'Invalid email or password' })];
                    }
                    _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                    return [2 /*return*/, done(null, userWithoutPassword)];
                case 3:
                    error_1 = _a.sent();
                    return [2 /*return*/, done(error_1)];
                case 4: return [2 /*return*/];
            }
        });
    }); }));
    // Passport serialization
    passport_1.default.serializeUser(function (user, done) {
        done(null, user.id);
    });
    passport_1.default.deserializeUser(function (id, done) { return __awaiter(_this, void 0, void 0, function () {
        var user, _, userWithoutPassword, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, storage_1.storage.getUser(id)];
                case 1:
                    user = _a.sent();
                    if (user && user.password) {
                        _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                        done(null, userWithoutPassword);
                    }
                    else {
                        done(null, user);
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    done(error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    // Registration endpoint
    app.post('/api/register', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var _a, email, password, firstName, lastName, existingUser, hashedPassword, newUser_1, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    _a = req.body, email = _a.email, password = _a.password, firstName = _a.firstName, lastName = _a.lastName;
                    // Validation
                    if (!email || !password) {
                        return [2 /*return*/, res.status(400).json({ message: 'Email and password are required' })];
                    }
                    if (password.length < 6) {
                        return [2 /*return*/, res.status(400).json({ message: 'Password must be at least 6 characters long' })];
                    }
                    return [4 /*yield*/, storage_1.storage.getUserByEmail(email)];
                case 1:
                    existingUser = _b.sent();
                    if (existingUser) {
                        return [2 /*return*/, res.status(400).json({ message: 'An account with this email already exists' })];
                    }
                    return [4 /*yield*/, hashPassword(password)];
                case 2:
                    hashedPassword = _b.sent();
                    return [4 /*yield*/, storage_1.storage.createUser({
                            email: email,
                            password: hashedPassword,
                            firstName: firstName || null,
                            lastName: lastName || null,
                        })];
                case 3:
                    newUser_1 = _b.sent();
                    // Log the user in
                    req.login(newUser_1, function (err) {
                        if (err) {
                            console.error('Login error after registration:', err);
                            return res.status(500).json({ message: 'Registration successful but login failed' });
                        }
                        var _ = newUser_1.password, userWithoutPassword = __rest(newUser_1, ["password"]);
                        res.status(201).json(userWithoutPassword);
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _b.sent();
                    console.error('Registration error:', error_3);
                    res.status(500).json({ message: 'Internal server error' });
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // Login endpoint
    app.post('/api/login', function (req, res, next) {
        passport_1.default.authenticate('local', function (err, user, info) {
            if (err) {
                console.error('Authentication error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            if (!user) {
                return res.status(401).json({ message: (info === null || info === void 0 ? void 0 : info.message) || 'Invalid credentials' });
            }
            req.login(user, function (loginErr) {
                if (loginErr) {
                    console.error('Login error:', loginErr);
                    return res.status(500).json({ message: 'Login failed' });
                }
                res.json(user);
            });
        })(req, res, next);
    });
    // Logout endpoint
    app.post('/api/logout', function (req, res) {
        req.logout(function (err) {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ message: 'Logout failed' });
            }
            res.json({ message: 'Logged out successfully' });
        });
    });
}
// Authentication middleware
var requireAuth = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
};
exports.requireAuth = requireAuth;
