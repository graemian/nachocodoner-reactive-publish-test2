import {Mongo} from "meteor/mongo";
import {Meteor} from "meteor/meteor";

export const Posts = new Mongo.Collection('posts');
export const Users = Meteor.users;

export const Cheeses = new Mongo.Collection('cheeses');

global._Posts = Posts;
global._Users = Users;
global._Cheeses = Cheeses;

export async function bump() {

    await Meteor.callAsync("bump");

}

global._bump = bump;