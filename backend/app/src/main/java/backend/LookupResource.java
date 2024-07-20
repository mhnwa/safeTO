package backend;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import types.Place;
import singleton.GsonSingleton;

import geography.ReverseGeocoding;

@Path("/lookup")
public class LookupResource {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response lookup(@QueryParam("lat") float latitude, @QueryParam("long") float longitude) {
        Place place = ReverseGeocoding.resolve(latitude, longitude);
        if (place != null) {
            return Response.ok(GsonSingleton.getGson().toJson(place)).build();
        }
        return Response.status(Status.INTERNAL_SERVER_ERROR).build();
    }
}
