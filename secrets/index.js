

const {
    SecretsManagerClient,
    GetSecretValueCommand,
    CreateSecretCommand, UpdateSecretCommand
} = require("@aws-sdk/client-secrets-manager");



const client = new SecretsManagerClient({
    region: "us-east-2",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
});

const secret_name_context = process.env.AWS_SECRET_MANAGER_SECRET_CONTEXT
const FetchSecret = async (orgId) => {
    try {
        let response = await client.send(
            new GetSecretValueCommand({
                SecretId: secret_name_context + orgId,
                VersionStage: "AWSCURRENT",
            })
        );
        console.log("Response :", response.SecretString)
        const data = JSON.parse(response.SecretString);
        let isValid = true;
        for (let i in data) {
            if (!data[i] && i !== 'mc' && i !== 'email') {
                isValid = false
            }
        }
        return { success: true, data, isValid }
    } catch (error) {
        console.log('Error : While fetching secrets :', error.message);
        return { success: false, data: {} };
    }
}


const createSecretCred = async (update = false, orgId, secretObject) => {

    const secret = {
        chRobinson: '',
        newtrul: '',
    };

    const params = {
        [update ? 'SecretId' : 'Name']: secret_name_context + orgId,
        SecretString: JSON.stringify(update ? secretObject : secret)
    };

    let command;
    try {
        if (!update)
            command = new CreateSecretCommand(params);
        else
            command = new UpdateSecretCommand(params)

        const response = await client.send(command);
        console.log('Secret created successfully:', response);
        return { success: true, data: response };
    } catch (err) {
        console.error('Error creating secret:', err);
        return { success: false, message: err.message }
    }
}





module.exports = { FetchSecret, createSecretCred }