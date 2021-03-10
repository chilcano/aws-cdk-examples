import boto3

def main():
    s3 = boto3.resource('s3')
    n = 0
    for bucket in s3.buckets.all():
        n = n + 1
        print("\t", n, " - " + bucket.name)

main()