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
exports.registerRoutes = registerRoutes;
var http_1 = require("http");
var storage_1 = require("./storage");
var auth_1 = require("./auth");
function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var httpServer;
        var _this = this;
        return __generator(this, function (_a) {
            // Setup authentication middleware
            (0, auth_1.setupAuth)(app);
            // Auth routes
            app.get('/api/auth/user', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, password, userWithoutPassword, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            // Check if user is authenticated
                            if (!req.isAuthenticated || !req.isAuthenticated()) {
                                return [2 /*return*/, res.status(401).json({ message: "Not authenticated" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUser(req.user.id)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(404).json({ message: "User not found" })];
                            }
                            password = user.password, userWithoutPassword = __rest(user, ["password"]);
                            res.json(userWithoutPassword);
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            console.error("Error fetching user:", error_1);
                            res.status(500).json({ message: "Failed to fetch user" });
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Movies API route (protected)
            app.get("/api/movies", auth_1.requireAuth, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var movies;
                return __generator(this, function (_a) {
                    movies = [
                        {
                            id: "ubuntu-stories",
                            title: "Ubuntu: Stories of Connection",
                            description: "A powerful exploration of Ubuntu philosophy in modern South Africa",
                            url: "https://vz-685277f9-aa1.b-cdn.net/movies/ubuntu-short.mp4",
                            thumbnail: "/api/placeholder/300/200",
                            category: "Madifa Original",
                            duration: "45 minutes",
                            year: 2024
                        },
                        {
                            id: "township-tales",
                            title: "Township Tales",
                            description: "Authentic stories from the heart of South African communities",
                            url: "https://vz-685277f9-aa1.b-cdn.net/movies/township-tales.mp4",
                            thumbnail: "/api/placeholder/300/200",
                            category: "Community Stories",
                            duration: "32 minutes",
                            year: 2024
                        },
                        {
                            id: "mzansi-dreams",
                            title: "Mzansi Dreams",
                            description: "Youth aspirations and dreams in contemporary South Africa",
                            url: "https://vz-685277f9-aa1.b-cdn.net/movies/mzansi-dreams.mp4",
                            thumbnail: "/api/placeholder/300/200",
                            category: "Youth Aspirations",
                            duration: "28 minutes",
                            year: 2024
                        },
                        {
                            id: "heritage-journey",
                            title: "Heritage Journey",
                            description: "A cultural documentary exploring South African heritage",
                            url: "https://vz-685277f9-aa1.b-cdn.net/movies/heritage-journey.mp4",
                            thumbnail: "/api/placeholder/300/200",
                            category: "Cultural Documentary",
                            duration: "52 minutes",
                            year: 2024
                        },
                        {
                            id: "love-in-johannesburg",
                            title: "Love in Johannesburg",
                            description: "A romantic drama set against the vibrant backdrop of Johannesburg",
                            url: "https://vz-685277f9-aa1.b-cdn.net/movies/love-in-johannesburg.mp4",
                            thumbnail: "/api/placeholder/300/200",
                            category: "Romance Drama",
                            duration: "68 minutes",
                            year: 2024
                        },
                        {
                            id: "amandla-power",
                            title: "Amandla: The Power Within",
                            description: "An inspirational story of inner strength and community power",
                            url: "https://vz-685277f9-aa1.b-cdn.net/movies/amandla-power.mp4",
                            thumbnail: "/api/placeholder/300/200",
                            category: "Inspirational",
                            duration: "41 minutes",
                            year: 2024
                        }
                    ];
                    res.json(movies);
                    return [2 /*return*/];
                });
            }); });
            // Auth page route - handle both /auth and /auth.html
            app.get('/auth', function (req, res) {
                res.sendFile('auth.html', { root: process.cwd() });
            });
            // Public routes
            app.get('/api/status', function (req, res) {
                res.json({
                    status: 'ok',
                    authenticated: !!req.isAuthenticated && req.isAuthenticated(),
                    timestamp: new Date().toISOString()
                });
            });
            httpServer = (0, http_1.createServer)(app);
            return [2 /*return*/, httpServer];
        });
    });
}
