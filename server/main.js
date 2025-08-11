import {Meteor} from 'meteor/meteor';
import {Cheeses, Posts, Users, Wines} from "../imports/api/data";

Meteor.methods({bump: async function(){

        await Meteor.users.updateAsync({_id: this.userId},{$inc:{'bumps':1}});

    }});

Meteor.publish('cheeses', function () {

    return Cheeses.find();

});

Meteor.publish('wines', function () {

    return Wines.find();

});

Meteor.publish('subscribed-posts', function (fetchBumpsField) {

    this.autorun(async () => {

        let fields = {subscribedPosts: 1};

        if (fetchBumpsField)
            fields.bumps = 1;

        const user = await Users.findOneAsync(this.userId, { fields });

        return Posts.find({ _id: { $in: user?.subscribedPosts || [] } });

    });

});