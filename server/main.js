import { Meteor } from 'meteor/meteor';
import {Cheeses, Posts, Users} from "../imports/api/data";

Meteor.methods({bump: async function(){

        await Meteor.users.updateAsync({_id: this.userId},{$inc:{'bumps':1}});

    }});


Meteor.publish('cheeses', function () {

    if (!this.userId)
        return [];

    return Cheeses.find();

});

Meteor.publish('subscribed-posts', function () {

    if (!this.userId)
        return [];

    this.autorun(async () => {
        const user = await Users.findOneAsync(this.userId, {
            fields: { subscribedPosts: 1 },
        });

        return Posts.find({ _id: { $in: user?.subscribedPosts || [] } });
    });
});