import type { MobileTransferRoute } from "./api";

export const staticMobileTransferRoutes = [
  {
    "id": "cmnclxrc40001m0bra1fwxis3",
    "origin": {
      "id": "cmjmfj1yx001d5y4lhy6rtb8s",
      "name": "Bahia Principe Grand Bavaro",
      "slug": "bahia-principe-grand-bavaro",
      "type": "HOTEL",
      "zoneName": "Punta Cana"
    },
    "destination": {
      "id": "cmncdnqej0011dwx5hzgy2iz0",
      "name": "All Seasons Hotel",
      "slug": "all-seasons-hotel",
      "type": "HOTEL",
      "zoneName": "Bayahibe"
    },
    "priceFrom": 130,
    "currency": "USD",
    "zoneLabel": "Punta Cana - Bayahibe"
  },
  {
    "id": "cmnce5iym000vlm42bqw2mdyp",
    "origin": {
      "id": "cmk6oyb62000ljwvlyxu7vbuy",
      "name": "Barceló Santo Domingo",
      "slug": "barcelo-santo-domingo",
      "type": "HOTEL",
      "zoneName": "Santo Domingo"
    },
    "destination": {
      "id": "cmncdnqej0011dwx5hzgy2iz0",
      "name": "All Seasons Hotel",
      "slug": "all-seasons-hotel",
      "type": "HOTEL",
      "zoneName": "Bayahibe"
    },
    "priceFrom": 150,
    "currency": "USD",
    "zoneLabel": "Santo Domingo - Bayahibe"
  },
  {
    "id": "cmnce4dwc000llm42t28v4tp9",
    "origin": {
      "id": "cmncdx6bg000396ssm3pnuips",
      "name": "La Romana International Airport",
      "slug": "la-romana-international-airport",
      "type": "AIRPORT",
      "zoneName": "La Romana"
    },
    "destination": {
      "id": "cmk6oyb62000ljwvlyxu7vbuy",
      "name": "Barceló Santo Domingo",
      "slug": "barcelo-santo-domingo",
      "type": "HOTEL",
      "zoneName": "Santo Domingo"
    },
    "priceFrom": 150,
    "currency": "USD",
    "zoneLabel": "Santo Domingo - La Romana"
  },
  {
    "id": "cmnce2ts2000blm42lfikfa6y",
    "origin": {
      "id": "cmncdx6bg000396ssm3pnuips",
      "name": "La Romana International Airport",
      "slug": "la-romana-international-airport",
      "type": "AIRPORT",
      "zoneName": "La Romana"
    },
    "destination": {
      "id": "cmncdnqej0011dwx5hzgy2iz0",
      "name": "All Seasons Hotel",
      "slug": "all-seasons-hotel",
      "type": "HOTEL",
      "zoneName": "Bayahibe"
    },
    "priceFrom": 94,
    "currency": "USD",
    "zoneLabel": "La Romana - Bayahibe"
  },
  {
    "id": "cmnce1k050001lm42fyopm56d",
    "origin": {
      "id": "cmncdx6bg000396ssm3pnuips",
      "name": "La Romana International Airport",
      "slug": "la-romana-international-airport",
      "type": "AIRPORT",
      "zoneName": "La Romana"
    },
    "destination": {
      "id": "cmjmfj1yx001d5y4lhy6rtb8s",
      "name": "Bahia Principe Grand Bavaro",
      "slug": "bahia-principe-grand-bavaro",
      "type": "HOTEL",
      "zoneName": "Punta Cana"
    },
    "priceFrom": 100,
    "currency": "USD",
    "zoneLabel": "Punta Cana - La Romana"
  },
  {
    "id": "cmk0p1d7b0005cv3eh7ybryfq",
    "origin": {
      "id": "cmjmfj1yx001d5y4lhy6rtb8s",
      "name": "Bahia Principe Grand Bavaro",
      "slug": "bahia-principe-grand-bavaro",
      "type": "HOTEL",
      "zoneName": "Punta Cana"
    },
    "destination": {
      "id": "cmk6oyb62000ljwvlyxu7vbuy",
      "name": "Barceló Santo Domingo",
      "slug": "barcelo-santo-domingo",
      "type": "HOTEL",
      "zoneName": "Santo Domingo"
    },
    "priceFrom": 175,
    "currency": "USD",
    "zoneLabel": "Punta Cana - Santo Domingo"
  }
] satisfies MobileTransferRoute[];
