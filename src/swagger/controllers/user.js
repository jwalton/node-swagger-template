// This is a controller.

export function getUser(req, res) {
    // variables defined in the Swagger document can be referenced using
    // req.swagger.params.{parameter_name}
    const id = req.swagger.params.id.value;

    // This sends back a JSON response.  In a real application we'd
    // go to mongodb or some other application logic here.
    res.json({
        id,
        username: 'jwalton'
    });
}

export function putUser(req, res) {
    res.json({ok: true});
}