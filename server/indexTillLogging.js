const needle = require('needle')
const config = require('dotenv').config()
const TOKEN = process.env.TWITTER_BEARER_TOKEN

const rulesURL = 'https://api.twitter.com/2/tweets/search/stream/rules'
const streamURL = 'https://api.twitter.com/2/tweets/search/stream?tweet.fields=public_metrics&expansions=author_id'
// const streamURL = 'https://api.twitter.com/2/users/AswinBarath2/tweets?expansions=attachments.poll_ids,attachments.media_keys,author_id,entities.mentions.username,geo.place_id,in_reply_to_user_id,referenced_tweets.id,referenced_tweets.id.author_id&tweet.fields=attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,public_metrics,referenced_tweets,reply_settings,source,text,withheld&user.fields=created_at,description,entities,id,location,name,pinned_tweet_id,profile_image_url,protected,public_metrics,url,username,verified,withheld&place.fields=contained_within,country,country_code,full_name,geo,id,name,place_type&poll.fields=duration_minutes,end_datetime,id,options,voting_status&media.fields=duration_ms,height,media_key,preview_image_url,type,url,width,public_metrics,non_public_metrics,organic_metrics,promoted_metrics&max_results=5'

const rules = [{value: '#100DaysOfCode'}]

// Get stream rules
async function getRules() {
    const response = await needle('get', rulesURL, {
        headers: {
            Authorization : `Bearer ${TOKEN}`
        }
    })

    return response.body
}

// Set stream rules
async function setRules() {

    const data = {
        add: rules
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization : `Bearer ${TOKEN}`
        }
    })

    return response.body
}

// Delete stream rules
async function deleteRules(rules) {

    if(!Array.isArray(rules.data)) {
        return null;
    }

    const ids = rules.data.map((rule) => rule.id)

    const data = {
        delete: {
            ids: ids
        }
    }

    const response = await needle('post', rulesURL, data, {
        headers: {
            'content-type': 'application/json',
            Authorization : `Bearer ${TOKEN}`
        }
    })

    return response.body
}

function streamTweets() {
    const stream = needle.get(streamURL, {
        headers: {
            Authorization: `Bearer ${TOKEN}`
        }
    })

    stream.on('data', (data) => {
        try {
            const json = JSON.parse(data)
            console.log(json)
        } catch(error) {}
    })
}

(async () => {
    let currentRules;

    try {
        // Gete all stream rules
        currentRules = await getRules()

        // Delete all stream rules
        await deleteRules(currentRules)

        // Set rules based on array above
        await setRules()
    } catch(error) {
        console.error(error)
        process.exit(1)
    }

    streamTweets()

})()
