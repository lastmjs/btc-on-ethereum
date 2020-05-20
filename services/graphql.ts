export async function gqlRequest(fetch: any, query: string, variables?: {}) {
    const result = await fetch('https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            query,
            variables
        })
    });

    const resultJSON = await result.json();

    return resultJSON;
}