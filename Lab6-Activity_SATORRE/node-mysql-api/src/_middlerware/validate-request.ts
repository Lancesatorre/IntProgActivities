export default validateRequest;

function validateRequest(req: any, next: any, schema: any) {
    const options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknwon: true
    };

    console.log('Validating request body:', req.body);
    const {error, value} = schema.validate(req.body, options);

    if (error) {
        console.log('Validation error:', error.details.map(x => x.message).join(', '));
        next(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    } else {
        console.log('Validation passed');
        req.body = value;
        next();
    }
}