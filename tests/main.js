import assert from "assert";
import {bump, Cheeses, Posts, Users, Wines} from "../imports/api/data";

import {Meteor} from "meteor/meteor";

if (Meteor.isServer) {

    import "/server/main";

    Meteor.methods({
        setupDb: async function () {

            await Posts.removeAsync({});
            await Users.removeAsync({});
            await Cheeses.removeAsync({});
            await Wines.removeAsync({});

            await Cheeses.insertAsync({name: "cheddar"});
            await Cheeses.insertAsync({name: "mozzarella"});

            await Wines.insertAsync({name: "Merlot"});
            await Wines.insertAsync({name: "Cabernet Sauvignon"});

            const postIds = []; 
            
            for (let i = 1; i <= 5; i++) { 
                
                const postId = await Posts.insertAsync({ name: `post${i}` }); 
                postIds.push(postId);
            
            }

            const userId = await Accounts.createUser({username: 'bob', password: '123'});

            await Users.updateAsync({_id: userId}, {$set: {subscribedPosts: postIds}});

        },
    });


}

function sleep() {
    return new Promise(resolve => Meteor.setTimeout(resolve, 500));
}

async function setupTest(test) {
    test.timeout(10000);

    await Meteor.logout();
    await sleep();
    assert.equal(Meteor.userId(), null, "Not logged out");

    await Meteor.callAsync("setupDb");
    await sleep();
}

async function runReactiveTest(test, fetchUserBumpsField) {

    await sleep();

    await setupTest(test);

    const postsSub = Meteor.subscribe('subscribed-posts', {fetchUserBumpsField});
    // const winesSub = Meteor.subscribe('wines');
    const cheesesSub = Meteor.subscribe('cheeses');

    try {

        await sleep();

        await Meteor.loginWithPassword("bob", "123");
        await sleep();

        assert.notEqual(Meteor.userId(), null, "Not logged in");

        await sleep();

        const cheese = await Cheeses.findOneAsync();
        console.log("cheese", cheese);
        assert.notEqual(cheese, undefined, "Cheese not found before bump");

        await bump();
        await sleep();
        await sleep();

        const cheese2 = await Cheeses.findOneAsync();
        console.log("cheese2", cheese2);
        assert.notEqual(cheese2, undefined, "Cheese not found after bump");

    } finally {

        postsSub.stop();
        // winesSub.stop();
        cheesesSub.stop();

    }
}

async function runReactiveFieldPubTest(test, onlyPublishNameField) {

    await sleep();

    await setupTest(test);

    const postsSub = Meteor.subscribe('subscribed-posts', {onlyPublishNameField});
    // const winesSub = Meteor.subscribe('wines');
    const cheesesSub = Meteor.subscribe('cheeses');

    try {

        await sleep();

        await Meteor.loginWithPassword("bob", "123");
        await sleep();

        assert.notEqual(Meteor.userId(), null, "Not logged in");

        await sleep();

        const cheese = await Cheeses.findOneAsync();
        console.log("cheese", cheese);
        assert.notEqual(cheese, undefined, "Cheese not found before bump");

        await Posts.insertAsync({name: "new"});

        const post = await Posts.findOneAsync({name: "post1"});

        await Posts.updateAsync({_id: post._id}, {$set: {bumped: true}});

        await sleep();
        await sleep();

        const cheese2 = await Cheeses.findOneAsync();
        console.log("cheese2", cheese2);
        assert.notEqual(cheese2, undefined, "Cheese not found after bump");

    } finally {

        postsSub.stop();
        // winesSub.stop();
        cheesesSub.stop();

    }
}

describe("nachocodoner-reactive-publish-test2", function () {

    if (Meteor.isClient) {

        it("reactive sub with modded field fetch", async function () {

            await runReactiveTest(this, true);

        });

        it("reactive sub without modded field fetch", async function () {

            await runReactiveTest(this, false);

        });

        it("update reactive pub with field", async function () {

            let test = this;

            await runReactiveFieldPubTest(test, false);

        });

        it("update reactive pub without field", async function () {

            let test = this;

            await runReactiveFieldPubTest(test, true);

        });

    }

});
