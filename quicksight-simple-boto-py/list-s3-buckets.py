import boto3

# Let's use Amazon S3
s3 = boto3.resource('s3')

# Print out bucket names
n = 0
for bucket in s3.buckets.all():
    n = n + 1
    print("\t", n, " - " + bucket.name)

# Upload a new file
#data = open('test.jpg', 'rb')
#s3.Bucket('test-bucket').put_object(Key='test.jpg', Body=data)
