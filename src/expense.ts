import { S3Client, GetObjectCommand, GetObjectCommandInput } from "@aws-sdk/client-s3";
import {S3Event} from 'aws-lambda';
import { cost } from "./types";
import * as csv from 'csv';

const s3Client = new S3Client({region: process.env.AWS_REGION});
export const handler = async (event:S3Event) => {
    const bucketParams : GetObjectCommandInput = {
        Bucket: event.Records[0].s3.bucket.name,
        Key: event.Records[0].s3.object.key
    }
    console.log(bucketParams);
    try{
        const data = await s3Client.send(new GetObjectCommand(bucketParams));
        if (data.Body){
            const response = await data.Body.transformToString();
            csv.parse(response,{delimiter:',',columns:true})
            .on('data',(csvData:cost)=>{
                console.log(csvData);
                console.log(csvData.date,csvData.cost_head,csvData.cost);
            })
            .on("close",()=>{
                console.log('all the records are processed');
            })
            .on('error',(err)=>{
                console.log('Error ocured on processing',err);
            })
        }
    }catch(e){
        console.log(e)
    }
    
}