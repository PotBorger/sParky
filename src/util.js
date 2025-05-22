// src/util.js
import {
  SearchTextCommand,
  ReverseGeocodeCommand,
  SearchNearbyCommand,
  SuggestCommand,
  GetPlaceCommand
} from "@aws-sdk/client-geo-places";

/**
 * Adapter for Maplibre-GL-Geocoder
 */
export default class GeoPlaces {
  /**
   * @param {GeoPlacesClient} client  – AWS Places client
   * @param {maplibregl.Map} map      – MapLibre map instance
   */
  constructor(client, map) {
    this.client = client;
    this.map    = map;
  }

  /** Forward geocoding for typing/suggestions */
  async forwardGeocode(config) {
    try {
      const center = this.map.getCenter();
      const req = {
        QueryText:    config.query,
        BiasPosition: [center.lng, center.lat],
        Language:     "en",t
      };
      const resp = await this.client.send(new SearchTextCommand(req));
      return {
        features: resp?.ResultItems?.map(r => this._toView(r)) || [],
      };
    } catch (err) {
      console.error("GeoPlaces.forwardGeocode error:", err);
      return { features: [] };
    }
  }

  /** Reverse geocoding (click vs. general) */
  async reverseGeocode(config) {
    try {
      const limit = config.click ? 1 : 15;
      const req = {
        QueryPosition: config.query,
        MaxResults:    limit,
        Language:      "en",
      };
      const Cmd = config.click
        ? ReverseGeocodeCommand
        : SearchNearbyCommand;
      const resp = await this.client.send(new Cmd(req));
      return {
        features: resp?.ResultItems?.map(r => this._toView(r)) || [],
      };
    } catch (err) {
      console.error("GeoPlaces.reverseGeocode error:", err);
      return { features: [] };
    }
  }

  /** Hint suggestions as you type */
  async getSuggestions(config) {
    try {
      const center = this.map.getCenter();
      const req = {
        QueryText:         config.query,
        BiasPosition:      [center.lng, center.lat],
        AdditionalFeatures:["Core"],
        Language:          "en",
      };
      const resp = await this.client.send(new SuggestCommand(req));
      return {
        features: resp?.ResultItems?.map(item =>
          this._toView(
            item.SuggestResultItemType === "Place" ? item.Place : item
          )
        ) || [],
      };
    } catch (err) {
      console.error("GeoPlaces.getSuggestions error:", err);
      return { features: [] };
    }
  }

  /** Lookup full place by its ID */
  async searchByPlaceId(placeId) {
    try {
      const req = { Language: "en", PlaceId: placeId };
      const resp = await this.client.send(new GetPlaceCommand(req));
      return {
        features: resp ? [this._toView(resp)] : [],
      };
    } catch (err) {
      console.error("GeoPlaces.searchByPlaceId error:", err);
      return { features: [] };
    }
  }

  /** normalize AWS result into Maplibre feature */
  _toView(result) {
    if (result.SuggestResultItemType === "Query") {
      return {
        geometry:   { type: "NA", coordinates: [] },
        result_type:"Query",
        place_name: result.Title || "",
        properties: result.Query || "",
        place_type: result.Query?.QueryType || "",
        id:         result.Query?.QueryId || "",
      };
    } else {
      return {
        geometry: {
          type:        "Point",
          coordinates: result.Position || [],
        },
        result_type: "Place",
        id:          result.PlaceId || "",
        text:        result.Title,
        place_name:  result.Address?.Label || "",
        place_type:  result.PlaceType || "",
        properties:  result,
      };
    }
  }
}
