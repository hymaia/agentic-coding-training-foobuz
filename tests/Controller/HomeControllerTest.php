<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class HomeControllerTest extends WebTestCase
{
    public function testHomepageContainsPlayerElements(): void
    {
        $client = static::createClient();
        $crawler = $client->request('GET', '/');

        self::assertResponseIsSuccessful();
        self::assertSelectorExists('#playlist-tabs');
        self::assertSelectorExists('#play-toggle');
        self::assertSelectorExists('#prev');
        self::assertSelectorExists('#next');
        self::assertSelectorExists('#seekbar');
        self::assertSelectorExists('#play-toggle img[src$="play.svg"]');
        self::assertSelectorExists('#prev img[src$="skip-back.svg"]');
        self::assertSelectorExists('#next img[src$="skip-forward.svg"]');

        self::assertCount(0, $crawler->filter('#rewind, #fast-forward'));
    }
}
