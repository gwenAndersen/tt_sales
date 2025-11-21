import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import { type User, type PublicUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends PublicUser {}
  }
}

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.findUserByUsername(username);
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      const isMatch = await bcrypt.compare(password, user.hashedPassword);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password." });
      }
      const publicUser: PublicUser = {
        id: user.id,
        username: user.username,
      };
      return done(null, publicUser);
    } catch (err) {
      console.error("Error in Passport LocalStrategy:", err);
      return done(err);
    }
  })
);

passport.serializeUser((user: PublicUser, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    if (!user) {
      return done(null, false);
    }
    const publicUser: PublicUser = {
      id: user.id,
      username: user.username,
    };
    done(null, publicUser);
  } catch (err) {
    console.error("Error in Passport deserializeUser:", err);
    done(err);
  }
});