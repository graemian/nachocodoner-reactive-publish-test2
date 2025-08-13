import {Meteor} from 'meteor/meteor';
import {Cheeses, Posts, Users, Wines} from "../imports/api/data";

Meteor.methods({bump: async function(){

        await Meteor.users.updateAsync({_id: this.userId},{$inc:{'bumps':1}});

    }});

Meteor.publish('cheeses', function () {

    return Cheeses.find({});

});

Meteor.publish('wines', function () {

    return Wines.find({});

});

Meteor.publish('subscribed-posts', function ({fetchUserBumpsField, onlyPublishNameField}) {

    this.autorun(async () => {

        const userFields = {subscribedPosts: 1};

        if (fetchUserBumpsField)
            userFields.bumps = 1;

        const user = await Users.findOneAsync(this.userId, { fields: userFields });

        const postOptions = {};

        if (onlyPublishNameField)
            postOptions.fields = {name: 1};

        return Posts.find({ _id: { $in: user?.subscribedPosts || [] } }, postOptions);

    });

});