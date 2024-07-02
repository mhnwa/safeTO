package types;

import com.google.gson.annotations.SerializedName;

public class Address {
    private String road;
    private String neighbourhood;
    private String quarter;
    private String city;
    @SerializedName("state_district")
    private String stateDistrict;
    private String state;
    @SerializedName("ISO3166-2-lvl4")
    private String iso31662Lvl4;
    private String postcode;
    private String country;
    @SerializedName("country_code")
    private String countryCode;

    // Getters and setters
}
