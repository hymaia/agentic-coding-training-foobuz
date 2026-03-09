<?php

namespace App\Controller;

use App\Exception\PlaylistDataException;
use App\Service\PlaylistRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/playlists', name: 'api_playlists_')]
final class PlaylistApiController
{
    public function __construct(private readonly PlaylistRepository $playlistRepository)
    {
    }

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        try {
            return new JsonResponse(['playlists' => $this->playlistRepository->all()]);
        } catch (PlaylistDataException $exception) {
            return new JsonResponse([
                'error' => 'playlist_data_unavailable',
                'message' => $exception->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/{id}', name: 'detail', methods: ['GET'])]
    public function detail(string $id): JsonResponse
    {
        try {
            $playlist = $this->playlistRepository->find($id);
        } catch (PlaylistDataException $exception) {
            return new JsonResponse([
                'error' => 'playlist_data_unavailable',
                'message' => $exception->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        if ($playlist === null) {
            return new JsonResponse(['error' => 'playlist_not_found'], Response::HTTP_NOT_FOUND);
        }

        return new JsonResponse($playlist);
    }
}
