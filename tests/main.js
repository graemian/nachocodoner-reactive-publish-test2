import assert from "assert";
import {bump, Cheeses, Posts, Users} from "../imports/api/data";

import {Meteor} from "meteor/meteor";

if (Meteor.isServer) {

    import "/server/main";

    Meteor.methods({
        setupDb: async function () {

            await Posts.removeAsync({});
            await Users.removeAsync({});
            await Cheeses.removeAsync({});

            await Cheeses.insertAsync({name: "cheddar"});
            await Cheeses.insertAsync({name: "mozzarella"});

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

async function getCheeseCount() {
    return await CheesesCollection.find().countAsync();
}

async function runReactiveTest(lookupUserOutsideReactivePublish) {

    const postsSub = Meteor.subscribe('subscribed-posts');
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

        assert.notEqual(cheese, undefined, "Cheese not found after bump");

    } finally {

        postsSub.stop();
        cheesesSub.stop();

    }
}

describe("nachocodoner-reactive-publish-test", function () {

    if (Meteor.isClient) {

        it("reactive sub outside", async function () {

            await setupTest(this);

            await runReactiveTest(true);

        });

        it("reactive sub inside", async function () {

            await setupTest(this);

            await runReactiveTest(false);

        });

    }

});
